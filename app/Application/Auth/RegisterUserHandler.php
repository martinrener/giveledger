<?php

declare(strict_types=1);

namespace App\Application\Auth;

use App\Domain\Auth\EmailAlreadyRegisteredException;
use App\Domain\Auth\User;
use App\Domain\Auth\UserRepositoryInterface;
use App\Domain\Shared\TenantId;

final class RegisterUserHandler
{
    public function __construct(
        private readonly UserRepositoryInterface $users
    ) {}

    public function __invoke(RegisterUserCommand $command): void
    {
        if ($this->users->findByEmail($command->email) !== null) {
            throw new EmailAlreadyRegisteredException($command->email);
        }

        $user = User::register(
            $command->userId,
            TenantId::of($command->tenantId),
            $command->email,
            $command->password,
            $command->role
        );

        $this->users->save($user);
    }
}
