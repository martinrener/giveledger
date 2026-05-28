<?php

declare(strict_types=1);

namespace App\Infrastructure\Domain;

use App\Domain\Auth\TokenStorageInterface;

final class TokenStorage implements TokenStorageInterface
{
    public function __construct(private readonly \PDO $pdo) {}

    public function store(string $userId, string $token, \DateTimeImmutable $expiresAt): void
    {
        $insertToken = $this->pdo->prepare(
            'INSERT INTO auth_tokens (id, user_id, token, expires_at, created_at)
             VALUES (UUID(), :user_id, :token, :expires_at, NOW())'
        );

        $insertToken->execute([
            'user_id'    => $userId,
            'token'      => $token,
            'expires_at' => $expiresAt->format('Y-m-d H:i:s'),
        ]);
    }

    public function revoke(string $token): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM auth_tokens WHERE token = :token');
        $stmt->execute(['token' => $token]);
    }
}
