<?php
require_once __DIR__ . '/cpfValidator.php';

// Configuração do CORS Público
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Trata requisições OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Captura a URI da requisição
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Rota: GET /health
if ($requestUri === '/health' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(["status" => "UP"]);
    exit();
}

// Rota: GET /validar/{cpf}
if (preg_match('/^\/validar\/([^\/]+)$/', $requestUri, $matches) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $cpf = $matches[1];
    $cpfValido = validarCPF($cpf);

    if (!$cpfValido) {
        http_response_code(400);
        echo json_encode([
            "cpf" => $cpf,
            "valido" => false,
            "ativo" => false,
            "mensagem" => "CPF inválido"
        ]);
        exit();
    }

    // Simulação de CPF ativo conforme projeto original
    echo json_encode([
        "cpf" => $cpf,
        "valido" => true,
        "ativo" => true
    ]);
    exit();
}

// Rota não encontrada
http_response_code(404);
echo json_encode(["mensagem" => "Rota não encontrada"]);