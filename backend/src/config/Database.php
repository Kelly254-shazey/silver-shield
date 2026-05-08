<?php
/**
 * Database Connection - MySQL/MariaDB
 */
class Database {
    private static $connection = null;
    private static $initialized = false;

    public static function getConnection() {
        if (self::$connection === null) {
            try {
                $host = Env::get('DB_HOST', 'localhost');
                $user = Env::get('DB_USER', 'root');
                $password = Env::get('DB_PASSWORD', '');
                $dbName = Env::get('DB_NAME', 'silver_shield');
                $port = Env::get('DB_PORT', 3306);
                $timeout = (int)Env::get('DB_CONNECT_TIMEOUT', 5);

                mysqli_report(MYSQLI_REPORT_OFF);
                self::$connection = mysqli_init();
                self::$connection->options(MYSQLI_OPT_CONNECT_TIMEOUT, max(1, $timeout));
                @self::$connection->real_connect($host, $user, $password, $dbName, $port);

                if (self::$connection->connect_error) {
                    throw new Exception('Database connection failed: ' . self::$connection->connect_error);
                }

                if (!self::$connection->set_charset('utf8mb4')) {
                    error_log("Error loading character set utf8mb4: " . self::$connection->error);
                }
                self::$initialized = true;
            } catch (Exception $e) {
                error_log($e->getMessage());
                throw $e;
            }
        }
        return self::$connection;
    }

    public static function query($sql, $params = []) {
        $conn = self::getConnection();
        $stmt = $conn->prepare($sql);

        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        if (!empty($params)) {
            $types = '';
            foreach ($params as $param) {
                if (is_int($param)) $types .= 'i';
                elseif (is_float($param)) $types .= 'd';
                elseif (is_bool($param)) $types .= 'i';
                else $types .= 's';
            }
            $stmt->bind_param($types, ...$params);
        }

        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $result = $stmt->get_result();
        $rows = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
        }

        $stmt->close();
        return $rows;
    }

    public static function execute($sql, $params = []) {
        $conn = self::getConnection();
        $stmt = $conn->prepare($sql);

        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        if (!empty($params)) {
            $types = '';
            foreach ($params as $param) {
                if (is_int($param)) $types .= 'i';
                elseif (is_float($param)) $types .= 'd';
                elseif (is_bool($param)) $types .= 'i';
                else $types .= 's';
            }
            $stmt->bind_param($types, ...$params);
        }

        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $result = [
            'insertId' => $conn->insert_id,
            'affectedRows' => $stmt->affected_rows
        ];
        $stmt->close();
        return $result;
    }

    public static function close() {
        if (self::$connection) {
            self::$connection->close();
        }
    }
}
