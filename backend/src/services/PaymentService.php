<?php
/**
 * Payment Service - M-Pesa, PayPal, PayHero integration
 */
class PaymentService {
    private static function mpesaBaseUrl() {
        return strtolower((string)Env::get('MPESA_ENVIRONMENT', 'sandbox')) === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    public static function initiateMpesaPayment($phone, $amount, $description) {
        try {
            $phone = preg_replace('/[^0-9]/', '', $phone);
            if (strlen($phone) === 10 && $phone[0] === '0') {
                $phone = '254' . substr($phone, 1);
            } elseif (strlen($phone) === 9) {
                $phone = '254' . $phone;
            }

            // M-Pesa credentials
            $consumerKey = Env::get('MPESA_CONSUMER_KEY');
            $consumerSecret = Env::get('MPESA_CONSUMER_SECRET');
            $businessShortCode = Env::get('MPESA_SHORTCODE', '522522');
            $passKey = Env::get('MPESA_PASSKEY');

            if (!$consumerKey || !$consumerSecret) {
                throw new Exception('M-Pesa credentials not configured');
            }

            // Get access token
            $url = self::mpesaBaseUrl() . '/oauth/v1/generate?grant_type=client_credentials';
            $auth = base64_encode("$consumerKey:$consumerSecret");
            
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Basic $auth"]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, Env::isProduction());
            curl_setopt($ch, CURLOPT_TIMEOUT, 20);
            
            $response = curl_exec($ch);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($response === false) {
                throw new Exception("Failed to get M-Pesa access token: $curlError");
            }
            
            $tokenData = json_decode($response, true);
            if (!$tokenData || !isset($tokenData['access_token'])) {
                throw new Exception('Failed to get M-Pesa access token');
            }

            $accessToken = $tokenData['access_token'];
            $timestamp = date('YmdHis');
            $password = base64_encode($businessShortCode . $passKey . $timestamp);

            $paymentData = [
                'BusinessShortCode' => $businessShortCode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'TransactionType' => 'CustomerPayBillOnline',
                'Amount' => (int)$amount,
                'PartyA' => $phone,
                'PartyB' => $businessShortCode,
                'PhoneNumber' => $phone,
                'CallBackURL' => Env::get('MPESA_CALLBACK_URL'),
                'AccountReference' => Env::get('MPESA_ACCOUNT_REFERENCE', 'SilverShield'),
                'TransactionDesc' => Env::get('PAYMENT_PROMPT_DESCRIPTION', $description)
            ];

            $url = self::mpesaBaseUrl() . '/mpesa/stkpush/v1/processrequest';
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer $accessToken",
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, Env::isProduction());
            curl_setopt($ch, CURLOPT_TIMEOUT, 20);
            
            $response = curl_exec($ch);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($response === false) {
                throw new Exception("M-Pesa STK push failed: $curlError");
            }

            $decoded = json_decode($response, true);
            if (!is_array($decoded)) {
                throw new Exception('M-Pesa returned an invalid response');
            }

            return $decoded;
        } catch (Exception $e) {
            error_log('PaymentService error: ' . $e->getMessage());
            throw $e;
        }
    }

    public static function verifyMpesaPayment($checkoutRequestID) {
        // Implementation for verifying M-Pesa payment status
        return ['success' => true];
    }
}
