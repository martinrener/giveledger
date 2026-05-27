<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Controller\Auth;

use App\Application\Auth\LoginCommand;
use App\Application\Auth\RegisterUserCommand;
use App\Infrastructure\Application\HandlerBus;
use App\Infrastructure\Query\TenantFinder;
use Ramsey\Uuid\Uuid;

final class AuthController
{
    public function __construct(
        private readonly HandlerBus   $bus,
        private readonly TenantFinder $tenantFinder
    ) {}

    public function login(array $body, array $_params, ?string $_tenantId): array
    {
        $result = $this->bus->dispatch(new LoginCommand(
            email:    $body['email'] ?? '',
            password: $body['password'] ?? '',
        ));

        setcookie('auth_token', $result['token'], [
            'expires'  => time() + 86400,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure'   => getenv('APP_ENV') === 'production',
        ]);

        $tenant = $this->tenantFinder->findById($result['tenantId']);

        return [200, [
            'slug'       => $tenant['slug'],
            'churchName' => $tenant['name'],
            'userEmail'  => $result['userEmail'],
        ]];
    }

    public function register(array $body, array $_params, ?string $_tenantId): array
    {
        $tenant = $this->tenantFinder->findBySlug($body['tenant_slug'] ?? '');

        if ($tenant === null) {
            throw new \DomainException('Tenant not found.');
        }

        $this->bus->dispatch(new RegisterUserCommand(
            userId:   Uuid::uuid4()->toString(),
            tenantId: $tenant['id'],
            email:    $body['email'] ?? '',
            password: $body['password'] ?? '',
            role:     'admin',
        ));

        return [201, null];
    }
}
