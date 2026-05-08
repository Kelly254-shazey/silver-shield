<?php
/**
 * Donations Routes
 */
class DonationRoutes {
    public static function handleList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            $filters = [];
            $params = [];
            if (!empty($_GET['status'])) {
                $filters[] = 'status = ?';
                $params[] = $_GET['status'];
            }
            if (!empty($_GET['method'])) {
                $filters[] = 'method = ?';
                $params[] = strtoupper($_GET['method']);
            }
            $where = $filters ? 'WHERE ' . implode(' AND ', $filters) : '';
            $rows = Database::query(
                "SELECT * FROM donations $where ORDER BY createdAt DESC LIMIT 500",
                $params
            );

            if (($_GET['export'] ?? '') === 'csv') {
                self::csvResponse($rows);
            }

            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Donations list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch donations', 500);
        }
    }

    public static function handleInitiate() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        $input = Utils::getJsonInput();
        $method = strtoupper(trim($input['method'] ?? 'PAYHERO'));
        $amount = (float)($input['amount'] ?? 0);
        $donorName = trim($input['donorName'] ?? 'Anonymous Donor');
        $donorEmail = trim($input['donorEmail'] ?? $input['email'] ?? '');
        $donorPhone = self::normalizeKenyaPhone($input['donorPhone'] ?? $input['phone'] ?? '');
        $currency = strtoupper(trim($input['currency'] ?? 'KES'));

        if ($amount <= 0) {
            Utils::errorResponse('Method and valid amount are required.', 400);
        }

        if (!in_array($method, ['MPESA', 'PAYHERO', 'PAYPAL'])) {
            Utils::errorResponse('Unsupported donation method.', 400);
        }

        if (in_array($method, ['MPESA', 'PAYHERO']) && empty($donorPhone)) {
            Utils::errorResponse('Phone number is required for mobile money STK push.', 400);
        }

        try {
            $result = Database::execute(
                "INSERT INTO donations (donorName, donorEmail, donorPhone, amount, currency, method, status, programId, metadata, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, NOW())",
                [
                    $donorName,
                    $donorEmail,
                    $donorPhone,
                    $amount,
                    $currency,
                    $method,
                    $input['programId'] ?? null,
                    json_encode([])
                ]
            );

            $donationId = $result['insertId'];
            $reference = 'SILVER-' . $donationId;

            Database::execute(
                "UPDATE donations SET providerReference = ?, updatedAt = NOW() WHERE id = ?",
                [$reference, $donationId]
            );

            if ($method === 'PAYHERO') {
                $provider = PayHeroService::initiateStkPush(
                    $amount,
                    $donorPhone,
                    $reference,
                    Env::get('PAYMENT_PROMPT_DESCRIPTION', 'silvershield organization')
                );

                $providerReference = $provider['id'] ?? $provider['transactionId'] ?? $reference;
                Database::execute(
                    "UPDATE donations SET providerReference = ?, metadata = ?, updatedAt = NOW() WHERE id = ?",
                    [$providerReference, json_encode($provider), $donationId]
                );

                Utils::rawJsonResponse([
                    'donationId' => $donationId,
                    'method' => $method,
                    'status' => 'PENDING',
                    'providerReference' => $providerReference,
                    'providerMessage' => $provider['customerMessage'] ?? $provider['message'] ?? $provider['ResponseDescription'] ?? 'STK push sent.',
                    'normalizedPhone' => $provider['normalizedPhone'] ?? $donorPhone,
                    'providerPayload' => $provider
                ], 201);
            }

            if ($method === 'MPESA') {
                $provider = PaymentService::initiateMpesaPayment($donorPhone, $amount, 'Silver Shield Donation');
                Utils::rawJsonResponse([
                    'donationId' => $donationId,
                    'method' => $method,
                    'status' => 'PENDING',
                    'providerReference' => $provider['CheckoutRequestID'] ?? $reference,
                    'providerMessage' => $provider['CustomerMessage'] ?? $provider['ResponseDescription'] ?? 'STK push sent.',
                    'normalizedPhone' => $donorPhone,
                    'providerPayload' => $provider
                ], 201);
            }

            Utils::rawJsonResponse([
                'donationId' => $donationId,
                'method' => $method,
                'status' => 'PENDING',
                'providerReference' => $reference
            ], 201);
        } catch (Exception $e) {
            error_log('Donations initiate error: ' . $e->getMessage());
            Utils::errorResponse($e->getMessage() ?: 'Failed to initiate donation', 500);
        }
    }

    public static function handleMpesaDetails() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Utils::jsonResponse([
            'paybill' => Env::get('MPESA_PAYBILL', Env::get('MPESA_SHORTCODE', '522522')),
            'accountNumber' => Env::get('MPESA_ACCOUNT_NUMBER', '1342183193'),
            'promptDescription' => Env::get('PAYMENT_PROMPT_DESCRIPTION', 'silvershield organization'),
            'stkProvider' => Env::get('STK_PROVIDER', 'PAYHERO'),
            'environment' => Env::get('MPESA_ENVIRONMENT', 'sandbox'),
            'configured' => PayHeroService::isConfigured() || (bool)(Env::get('MPESA_CONSUMER_KEY') && Env::get('MPESA_CONSUMER_SECRET')),
            'warnings' => []
        ]);
    }

    public static function handleCreate() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        $input = Utils::getJsonInput();
        
        if (empty($input['amount']) || empty($input['email'])) {
            Utils::errorResponse('Amount and email are required', 400);
        }

        try {
            $sql = "
                INSERT INTO donations (donorName, email, amount, method, phone, message, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ";
            Database::query($sql, [
                $input['donorName'] ?? 'Anonymous',
                $input['email'] ?? '',
                (float)$input['amount'],
                $input['method'] ?? 'direct',
                $input['phone'] ?? '',
                $input['message'] ?? '',
                'pending'
            ]);

            Utils::jsonResponse(['message' => 'Donation created successfully'], 201);
        } catch (Exception $e) {
            error_log('Donations create error: ' . $e->getMessage());
            Utils::errorResponse('Failed to process donation', 500);
        }
    }

    public static function handleMpesaCallback() {
        $input = Utils::getJsonInput();
        // Process M-Pesa callback
        RealtimeService::recordEvent('mpesa_payment', $input);
        Utils::jsonResponse(['success' => true]);
    }

    public static function handlePayheroCallback() {
        $input = Utils::getJsonInput();
        $reference = self::firstNonEmpty($input, [
            'external_reference',
            'reference',
            'merchant_reference',
            'transaction_id',
            'TransactionID',
            'id'
        ]);
        $status = strtoupper((string)self::firstNonEmpty($input, ['status', 'result', 'state']));
        $mappedStatus = in_array($status, ['SUCCESS', 'COMPLETED', 'PAID']) ? 'COMPLETED' : (in_array($status, ['FAILED', 'CANCELLED', 'CANCELED']) ? 'FAILED' : 'PENDING');

        if ($reference) {
            Database::execute(
                "UPDATE donations SET status = ?, transactionId = COALESCE(transactionId, ?), metadata = ?, updatedAt = NOW()
                 WHERE providerReference = ? OR transactionId = ?",
                [$mappedStatus, $reference, json_encode($input), $reference, $reference]
            );
        }

        RealtimeService::recordEvent('payhero_payment', $input);
        Utils::jsonResponse(['success' => true]);
    }

    private static function firstNonEmpty($input, $keys) {
        foreach ($keys as $key) {
            if (isset($input[$key]) && $input[$key] !== '') {
                return $input[$key];
            }
        }
        return null;
    }

    private static function normalizeKenyaPhone($phone) {
        $digits = preg_replace('/\D+/', '', (string)$phone);
        if (preg_match('/^254(7|1)\d{8}$/', $digits)) {
            return $digits;
        }
        if (preg_match('/^0(7|1)\d{8}$/', $digits)) {
            return '254' . substr($digits, 1);
        }
        if (preg_match('/^(7|1)\d{8}$/', $digits)) {
            return '254' . $digits;
        }
        return $digits;
    }

    private static function csvResponse($rows) {
        $columns = ['id', 'donorName', 'donorEmail', 'donorPhone', 'amount', 'currency', 'method', 'status', 'providerReference', 'transactionId', 'createdAt'];
        $lines = [implode(',', $columns)];
        foreach ($rows as $row) {
            $values = [];
            foreach ($columns as $column) {
                $values[] = '"' . str_replace('"', '""', trim((string)($row[$column] ?? ''))) . '"';
            }
            $lines[] = implode(',', $values);
        }

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="silver-shield-donations-' . time() . '.csv"');
        echo implode("\n", $lines);
        exit;
    }
}
