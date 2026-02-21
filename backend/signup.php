<?php
// Allow CORS from local dev origins
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

// Trim inputs to remove spaces
$full_name = trim($data->fullName ?? '');
$email = trim($data->email ?? '');
$password = $data->password ?? '';

// Validate input
if (!$full_name || !$email || !$password) {
    echo json_encode(["error" => "All fields are required"]);
    exit();
}

// Check if email already exists
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["error" => "Email already exists"]);
    exit();
}

// Hash password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $full_name, $email, $hashed_password);

if (!$stmt->execute()) {
    echo json_encode(["error" => "Signup failed"]);
    exit();
}

// Close connections
$stmt->close();
$conn->close();
?>