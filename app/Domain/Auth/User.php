<?php

declare(strict_types=1);

namespace App\Domain\Auth;

use App\Domain\Shared\TenantId;

final class User
{
    private function __construct(
        private readonly string   $id,
        private readonly TenantId $tenantId,
        private readonly string   $email,
        private readonly string   $passwordHash,
        private readonly string   $role,
        private readonly \DateTimeImmutable $createdAt
    ) {}

    public static function register(
        string $id,
        TenantId $tenantId,
        string $email,
        string $plainPassword,
        string $role
    ): self {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException("Invalid email: {$email}");
        }
        if (strlen($plainPassword) < 8) {
            throw new \InvalidArgumentException('Password must be at least 8 characters.');
        }
        return new self($id, $tenantId, $email, password_hash($plainPassword, PASSWORD_BCRYPT), $role, new \DateTimeImmutable());
    }

    public static function reconstitute(
        string $id,
        TenantId $tenantId,
        string $email,
        string $passwordHash,
        string $role,
        \DateTimeImmutable $createdAt
    ): self {
        return new self($id, $tenantId, $email, $passwordHash, $role, $createdAt);
    }

    public function verifyPassword(string $plainPassword): bool
    {
        return password_verify($plainPassword, $this->passwordHash);
    }

    public function id(): string
    {
        return $this->id;
    }

    public function tenantId(): TenantId
    {
        return $this->tenantId;
    }

    public function email(): string
    {
        return $this->email;
    }

    public function role(): string
    {
        return $this->role;
    }

    public function createdAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
