<?php

declare(strict_types=1);

namespace App\Application\Auth;

use App\Domain\Auth\TokenStorageInterface;

final class LogoutHandler
{
    public function __construct(private readonly TokenStorageInterface $tokens) {}

    public function __invoke(LogoutCommand $command): void
    {
        $this->tokens->revoke($command->token);
    }
}
