<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_GET['url'])) {
    http_response_code(400);
    echo json_encode(["error" => "No URL provided"]);
    exit();
}

$targetUrl = $_GET['url'];

// Ensure the URL is an Ahrefs API URL
if (strpos($targetUrl, 'https://api.ahrefs.com/') !== 0) {
    http_response_code(403);
    echo json_encode(["error" => "Invalid target URL"]);
    exit();
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

// Forward the Authorization header from the client
$headers = [];
foreach (getallheaders() as $name => $value) {
    if (strtolower($name) === 'authorization') {
        $headers[] = "Authorization: $value";
    }
}
$headers[] = "Accept: application/json";

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => curl_error($ch)]);
} else {
    http_response_code($httpCode);
    header("Content-Type: application/json");
    echo $response;
}

curl_close($ch);
?>
