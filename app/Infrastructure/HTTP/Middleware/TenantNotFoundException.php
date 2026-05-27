<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Middleware;

final class TenantNotFoundException extends \RuntimeException
{
    public function __construct(string $slug)
    {
        parent::__construct("Tenant not found for slug: {$slug}");
    }
}
