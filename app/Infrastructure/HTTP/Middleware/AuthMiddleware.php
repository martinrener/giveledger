<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Middleware;

final class AuthMiddleware
{
    public function __construct(private readonly \PDO $pdo) {}

    public function authenticate(array $cookies, string $urlSlug): array
    {
        $token = $cookies['auth_token'] ?? null;

        if ($token === null) {
            throw new UnauthenticatedException();
        }

        $query = $this->pdo->prepare(
            'SELECT u.id AS user_id, u.tenant_id, u.role, t.slug
             FROM auth_tokens tok
             INNER JOIN users u ON u.id = tok.user_id
             INNER JOIN tenants t ON t.id = u.tenant_id
             WHERE tok.token = :token AND tok.expires_at > NOW()'
        );

        $query->execute(['token' => $token]);
        $row = $query->fetch(\PDO::FETCH_ASSOC);

        if ($row === false) {
            throw new UnauthenticatedException();
        }

        if ($row['slug'] !== $urlSlug) {
            throw new ForbiddenException();
        }

        return [
            'userId'   => $row['user_id'],
            'tenantId' => $row['tenant_id'],
            'role'     => $row['role'],
        ];
    }
}
