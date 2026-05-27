<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Middleware;

final class ForbiddenException extends \RuntimeException
{
    public function __construct()
    {
        parent::__construct('Forbidden.');
    }
}
