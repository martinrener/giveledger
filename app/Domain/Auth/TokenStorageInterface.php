<?php

declare(strict_types=1);

namespace App\Domain\Auth;

interface TokenStorageInterface
{
    public function store(string $userId, string $token, \DateTimeImmutable $expiresAt): void;
}
