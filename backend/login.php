<?php
// Allow CORS from any local development origin
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080'
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database config
include 'config.php';

// Get JSON input
$data = json_decode(file_get_contents("php://input"));

// Validate input
$email = trim($data->email ?? '');
$password = $data->password ?? '';

if (!$email || !$password) {
    echo json_encode(["error" => "All fields are required"]);
    exit();
}

// Prepare statement to prevent SQL injection
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["error" => "Invalid credentials"]);
    exit();
}

$user = $result->fetch_assoc();

// Verify password
if (password_verify($password, $user["password"])) {
    // Return user data only, no message
    echo json_encode([
        "fullName" => $user["full_name"],
        "email" => $user["email"]
    ]);
} else {
    echo json_encode(["error" => "Invalid credentials"]);
}

$stmt->close();
$conn->close();
?>