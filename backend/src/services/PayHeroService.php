<?php

class PayHeroService
{
    private static $auth;
    private static $channelId;
    private static $callbackUrl;

    public static function init()
    {
        self::$auth = Env::get('PAYHERO_AUTH');
        self::$channelId = Env::get('PAYHERO_CHANNEL_ID');
        self::$callbackUrl = Env::get('PAYHERO_CALLBACK_URL');
    }
    
    public static function isConfigured()
{
    self::init();

    return !empty(self::$auth)
        && !empty(self::$channelId);
}

    public static function normalizePhone($phone)
    {
        $digits = preg_replace('/[^0-9]/', '', $phone);

        if (preg_match('/^254(7|1)\d{8}$/', $digits)) {
            return $digits;
        }

        if (preg_match('/^0(7|1)\d{8}$/', $digits)) {
            return '254' . substr($digits, 1);
        }

        if (preg_match('/^(7|1)\d{8}$/', $digits)) {
            return '254' . $digits;
        }

        throw new Exception('Invalid phone number format');
    }

    public static function initiateStkPush(
        $amount,
        $phone,
        $accountReference = '',
        $customerName = 'Donation'
    ) {
        try {
            self::init();

            if (empty(self::$auth)) {
                throw new Exception('PAYHERO_AUTH missing');
            }

            if (empty(self::$channelId)) {
                throw new Exception('PAYHERO_CHANNEL_ID missing');
            }

            $phone = self::normalizePhone($phone);

            // Endpoint from your screenshot
            $url = 'https://backend.payhero.co.ke/api/v2/payments';

            $payload = [
                'amount' => (int)$amount,
                'phone_number' => $phone,
                'channel_id' => (int)self::$channelId,
                'provider' => 'm-pesa',
                'external_reference' => !empty($accountReference)
                    ? $accountReference
                    : 'SILVER-' . time(),
                'customer_name' => $customerName,
                'callback_url' => self::$callbackUrl
            ];

            $ch = curl_init();

            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => [
                    'Authorization: ' . self::$auth,
                    'Content-Type: application/json',
                    'Accept: application/json'
                ],
                CURLOPT_TIMEOUT => 30
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);

            curl_close($ch);

            if ($curlError) {
                throw new Exception($curlError);
            }

            $decoded = json_decode($response, true);

            if ($httpCode >= 400) {
                throw new Exception($response);
            }

            return [
                'response' => $decoded
            ];

        } catch (Exception $e) {
            error_log('PayHero Error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}