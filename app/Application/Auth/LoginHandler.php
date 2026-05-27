<?php

declare(strict_types=1);

namespace App\Application\Auth;

use App\Domain\Auth\TokenStorageInterface;
use App\Domain\Auth\UserRepositoryInterface;

final class LoginHandler
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly TokenStorageInterface   $tokens
    ) {}

    public function __invoke(LoginCommand $command): string
    {
        $user = $this->users->findByEmail($command->email);

        if ($user === null || !$user->verifyPassword($command->password)) {
            throw new \DomainException('Invalid email or password.');
        }

        $token     = bin2hex(random_bytes(32));
        $expiresAt = new \DateTimeImmutable('+24 hours');

        $this->tokens->store($user->id(), $token, $expiresAt);

        return $token;
    }
}
