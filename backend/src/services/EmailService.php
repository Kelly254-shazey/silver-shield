<?php
/**
 * Email Service - Send emails via SMTP
 */
class EmailService {
    public static function send($to, $subject, $html, $from = null, $fromName = null) {
        try {
            $from = $from ?? Env::get('SMTP_FROM_EMAIL', 'noreply@silvershield.org');
            $fromName = $fromName ?? Env::get('SMTP_FROM_NAME', 'Silver Shield');

            $headers = "From: $fromName <$from>\r\n";
            $headers .= "Reply-To: $from\r\n";
            $headers .= "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

            $smtpHost = Env::get('SMTP_HOST');
            if (empty($smtpHost)) {
                error_log("Email not sent - SMTP not configured: $to");
                return false;
            }

            return mail($to, $subject, $html, $headers);
        } catch (Exception $e) {
            error_log('EmailService error: ' . $e->getMessage());
            return false;
        }
    }

    public static function sendWelcome($email, $name) {
        $subject = 'Welcome to Silver Shield Organisation';
        $html = "
            <h2>Welcome, $name!</h2>
            <p>Thank you for joining Silver Shield Organisation.</p>
            <p>We're excited to have you on our journey of shaping lives through mentorship, outreach, and practical opportunity.</p>
        ";
        return self::send($email, $subject, $html);
    }

    public static function sendNotification($email, $title, $message) {
        $subject = "Silver Shield: $title";
        $html = "
            <h3>$title</h3>
            <p>$message</p>
            <p>Best regards,<br>Silver Shield Organisation</p>
        ";
        return self::send($email, $subject, $html);
    }
}
