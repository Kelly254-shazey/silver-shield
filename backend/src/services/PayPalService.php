<?php
/**
 * PayPal Service - PayPal payment integration
 */
class PayPalService {
    private static $clientId;
    private static $clientSecret;
    private static $environment;

    public static function init() {
        self::$clientId = Env::get('PAYPAL_CLIENT_ID');
        self::$clientSecret = Env::get('PAYPAL_CLIENT_SECRET');
        self::$environment = Env::get('PAYPAL_ENVIRONMENT', 'sandbox');
    }

    public static function isConfigured() {
        self::init();
        return !empty(self::$clientId) && !empty(self::$clientSecret);
    }

    private static function getBaseUrl() {
        return self::$environment === 'production'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }

    public static function getAccessToken() {
        try {
            $auth = base64_encode(self::$clientId . ':' . self::$clientSecret);
            $url = self::getBaseUrl() . '/v1/oauth2/token';

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Basic $auth",
                'Content-Type: application/x-www-form-urlencoded'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                throw new Exception("PayPal token request failed: $response");
            }

            $data = json_decode($response, true);
            return $data['access_token'] ?? null;
        } catch (Exception $e) {
            error_log('PayPal token error: ' . $e->getMessage());
            return null;
        }
    }

    public static function createOrder($amount, $currency = 'USD', $description = '') {
        if (!self::isConfigured()) {
            return [
                'mocked' => true,
                'id' => 'MOCK-PAYPAL-' . time(),
                'status' => 'CREATED',
                'links' => [
                    ['rel' => 'approve', 'href' => Env::get('PAYPAL_RETURN_URL') . '?mockPaypal=true']
                ]
            ];
        }

        try {
            $token = self::getAccessToken();
            if (!$token) {
                throw new Exception('Failed to get PayPal access token');
            }

            $url = self::getBaseUrl() . '/v2/checkout/orders';
            $payload = [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'description' => $description,
                        'amount' => [
                            'currency_code' => $currency,
                            'value' => number_format((float)$amount, 2, '.', '')
                        ]
                    ]
                ],
                'application_context' => [
                    'return_url' => Env::get('PAYPAL_RETURN_URL'),
                    'cancel_url' => Env::get('PAYPAL_CANCEL_URL')
                ]
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer $token",
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 201) {
                throw new Exception("PayPal order creation failed: $response");
            }

            return json_decode($response, true);
        } catch (Exception $e) {
            error_log('PayPal create order error: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    public static function captureOrder($orderId) {
        if (!self::isConfigured()) {
            return ['mocked' => true, 'id' => $orderId, 'status' => 'COMPLETED'];
        }

        try {
            $token = self::getAccessToken();
            if (!$token) {
                throw new Exception('Failed to get PayPal access token');
            }

            $url = self::getBaseUrl() . "/v2/checkout/orders/$orderId/capture";

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer $token",
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 201) {
                throw new Exception("PayPal order capture failed: $response");
            }

            return json_decode($response, true);
        } catch (Exception $e) {
            error_log('PayPal capture error: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }
}
