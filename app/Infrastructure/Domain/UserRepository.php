<?php

declare(strict_types=1);

namespace App\Infrastructure\Domain;

use App\Domain\Auth\User;
use App\Domain\Auth\UserRepositoryInterface;
use App\Domain\Shared\TenantId;

final class UserRepository implements UserRepositoryInterface
{
    public function __construct(private readonly \PDO $pdo) {}

    public function findByEmail(string $email): ?User
    {
        $query = $this->pdo->prepare(
            'SELECT id, tenant_id, email, password_hash, role, created_at
             FROM users
             WHERE email = :email
             LIMIT 1'
        );

        $query->execute(['email' => $email]);
        $row = $query->fetch(\PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function save(User $user): void
    {
        $upsertUser = $this->pdo->prepare(
            'INSERT INTO users (id, tenant_id, email, password_hash, role, created_at)
             VALUES (:id, :tenant_id, :email, :password_hash, :role, :created_at)
             ON DUPLICATE KEY UPDATE email = :email, role = :role'
        );

        $upsertUser->execute([
            'id'            => $user->id(),
            'tenant_id'     => $user->tenantId()->value(),
            'email'         => $user->email(),
            'password_hash' => $user->passwordHash(),
            'role'          => $user->role(),
            'created_at'    => $user->createdAt()->format('Y-m-d H:i:s'),
        ]);
    }

    private function hydrate(array $row): User
    {
        return User::reconstitute(
            $row['id'],
            TenantId::of($row['tenant_id']),
            $row['email'],
            $row['password_hash'],
            $row['role'],
            new \DateTimeImmutable($row['created_at'])
        );
    }
}
