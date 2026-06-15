<?php
header('Content-Type: application/json');
$response = [
    'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? null,
    'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'] ?? null,
    'PHP_SELF' => $_SERVER['PHP_SELF'] ?? null,
    'PATH_INFO' => $_SERVER['PATH_INFO'] ?? null,
    'REMOTE_ADDR' => $_SERVER['REMOTE_ADDR'] ?? null,
    'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? null,
];
echo json_encode($response, JSON_PRETTY_PRINT);
