<?php

declare(strict_types=1);

namespace App\Application\Auth;

final class RegisterUserCommand
{
    public function __construct(
        public readonly string $userId,
        public readonly string $tenantId,
        public readonly string $email,
        public readonly string $password,
        public readonly string $role
    ) {}
}
