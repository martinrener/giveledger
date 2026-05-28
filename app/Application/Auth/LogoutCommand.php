<?php

declare(strict_types=1);

namespace App\Application\Auth;

final class LogoutCommand
{
    public function __construct(public readonly string $token) {}
}
