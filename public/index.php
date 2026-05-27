<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Infrastructure\Application\HandlerBus;
use App\Infrastructure\HTTP\Controller\Auth\AuthController;
use App\Infrastructure\HTTP\Controller\Campaign\CampaignController;
use App\Infrastructure\HTTP\Controller\Donation\DonationController;
use App\Infrastructure\HTTP\Controller\Stream\StreamController;
use App\Infrastructure\HTTP\Controller\Tenant\TenantController;
use App\Infrastructure\HTTP\Middleware\AuthMiddleware;
use App\Infrastructure\HTTP\Middleware\ForbiddenException;
use App\Infrastructure\HTTP\Middleware\TenantNotFoundException;
use App\Infrastructure\HTTP\Middleware\TenantResolver;
use App\Infrastructure\HTTP\Middleware\UnauthenticatedException;
use App\Infrastructure\Query\CampaignFinder;
use App\Infrastructure\Query\TenantFinder;

header('Content-Type: application/json');

// --- Respond helper ---
$respond = static function (int $status, mixed $body): never {
    http_response_code($status);
    echo json_encode($body);
    exit;
};

// --- PDO ---
$pdo = new \PDO(
    sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', getenv('DB_HOST'), getenv('DB_NAME')),
    getenv('DB_USER'),
    getenv('DB_PASS'),
    [
        \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        \PDO::ATTR_EMULATE_PREPARES   => false,
    ]
);

// --- Redis ---
$redis = null;
try {
    $redis = new \Redis();
    $redis->connect((string) getenv('REDIS_HOST'), 6379);
} catch (\Throwable) {
    $redis = null;
}

// --- Request ---
$method  = $_SERVER['REQUEST_METHOD'];
$path    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$body    = (array) json_decode(file_get_contents('php://input'), true);
$cookies = $_COOKIE;

// --- Route matching ---
$routes  = require __DIR__ . '/../config/routes.php';
$matched = null;
$params  = [];

foreach ($routes as $route) {
    [$routeMethod, $pattern] = $route;
    if ($routeMethod !== $method) {
        continue;
    }
    if (!preg_match($pattern, $path, $matches)) {
        continue;
    }
    $params  = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
    $matched = $route;
    break;
}

if ($matched === null) {
    $respond(404, ['error' => 'Not found']);
}

[, , $middleware, $controllerClass, $action] = $matched;

// --- Middleware ---
$tenantId = null;

try {
    if ($middleware === 'tenant') {
        $tenantId = (new TenantResolver(new TenantFinder($pdo)))->resolve($params['slug']);
    } elseif ($middleware === 'admin') {
        $authContext = (new AuthMiddleware($pdo))->authenticate($cookies, $params['slug']);
        $tenantId    = $authContext['tenantId'];
    }
} catch (TenantNotFoundException) {
    $respond(404, ['error' => 'Tenant not found']);
} catch (UnauthenticatedException) {
    $respond(401, ['error' => 'Unauthenticated']);
} catch (ForbiddenException) {
    $respond(403, ['error' => 'Forbidden']);
}

// --- Controller factory ---
$bus = new HandlerBus($pdo, $redis);

$tenantFinder = new TenantFinder($pdo);

$controller = match ($controllerClass) {
    TenantController::class   => new TenantController($tenantFinder),
    CampaignController::class => new CampaignController($bus, new CampaignFinder($pdo)),
    DonationController::class => new DonationController($bus),
    AuthController::class     => new AuthController($bus, $tenantFinder),
    StreamController::class   => new StreamController($redis ?? new \Redis()),
};

// --- Dispatch ---
try {
    [$status, $responseBody] = $controller->$action($body, $params, $tenantId);
    $respond($status, $responseBody);
} catch (\DomainException $e) {
    $respond(422, ['error' => $e->getMessage()]);
} catch (\InvalidArgumentException $e) {
    $respond(400, ['error' => $e->getMessage()]);
} catch (\RuntimeException $e) {
    $respond(500, ['error' => 'Internal server error']);
}
