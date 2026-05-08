<?php
/**
 * PayHero Service - PayHero payment integration for Kenya
 */
class PayHeroService {
    private static $auth;
    private static $accountNumber;
    private static $channelId;
    private static $environment;
    private static $callbackUrl;

    public static function init() {
        self::$auth = Env::get('PAYHERO_AUTH');
        self::$accountNumber = Env::get('PAYHERO_ACCOUNT_NUMBER');
        self::$channelId = Env::get('PAYHERO_CHANNEL_ID');
        self::$environment = Env::get('PAYHERO_ENVIRONMENT', 'sandbox');
        self::$callbackUrl = Env::get('PAYHERO_CALLBACK_URL');
    }

    public static function isConfigured() {
        self::init();
        return !empty(self::$auth) && !empty(self::$accountNumber) && !empty(self::$channelId);
    }

    private static function getBaseUrl() {
        return self::$environment === 'production'
            ? 'https://api.payhero.io'
            : 'https://api-sandbox.payhero.io';
    }

    public static function normalizePhone($phone) {
        $digits = preg_replace('/[^0-9]/', '', $phone);

        if (empty($digits)) {
            throw new Exception('Phone number is required for PayHero STK push');
        }

        // Handle Kenyan phone numbers
        if (preg_match('/^254(7|1)\d{8}$/', $digits)) {
            return $digits;
        }
        if (preg_match('/^0(7|1)\d{8}$/', $digits)) {
            return '254' . substr($digits, 1);
        }
        if (preg_match('/^(7|1)\d{8}$/', $digits)) {
            return '254' . $digits;
        }

        throw new Exception('Invalid phone format. Use 07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX');
    }

    public static function initiateStkPush($amount, $phone, $accountReference = '', $description = 'Payment') {
        if (!self::isConfigured()) {
            return [
                'mocked' => true,
                'id' => 'MOCK-PAYHERO-' . time(),
                'status' => 'PENDING',
                'normalizedPhone' => $phone,
                'environment' => 'mocked'
            ];
        }

        try {
            $normalizedPhone = self::normalizePhone($phone);
            $url = self::getBaseUrl() . '/api/v1/request-money';
            $description = trim((string)$description);
            if ($description === '') {
                $description = Env::get('PAYMENT_PROMPT_DESCRIPTION', 'silvershield organization');
            }

            $payload = [
                'amount' => (int)$amount,
                'phone_number' => $normalizedPhone,
                'account_number' => self::$accountNumber,
                'description' => $description,
                'channel_id' => (int)self::$channelId,
                'callback_url' => self::$callbackUrl,
                'external_reference' => $accountReference
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: ' . self::$auth,
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, Env::isProduction());
            curl_setopt($ch, CURLOPT_TIMEOUT, 20);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($response === false) {
                throw new Exception("PayHero STK push failed: $curlError");
            }

            if ($httpCode >= 400) {
                throw new Exception("PayHero STK push failed: $response");
            }

            $decoded = json_decode($response, true);
            if (!is_array($decoded)) {
                throw new Exception('PayHero returned an invalid response');
            }

            $decoded['normalizedPhone'] = $normalizedPhone;
            return $decoded;
        } catch (Exception $e) {
            error_log('PayHero error: ' . $e->getMessage());
            throw $e;
        }
    }

    public static function verifyTransaction($transactionId) {
        if (!self::isConfigured()) {
            return ['mocked' => true, 'status' => 'SUCCESS', 'id' => $transactionId];
        }

        try {
            $url = self::getBaseUrl() . "/api/v1/query/$transactionId";

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: ' . self::$auth,
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, Env::isProduction());
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return json_decode($response, true);
        } catch (Exception $e) {
            error_log('PayHero verify error: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }
}
