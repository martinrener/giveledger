<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Middleware;

use App\Infrastructure\Query\TenantFinder;

final class TenantResolver
{
    public function __construct(private readonly TenantFinder $tenantFinder) {}

    public function resolve(string $slug): string
    {
        $tenant = $this->tenantFinder->findBySlug($slug);

        if ($tenant === null) {
            throw new TenantNotFoundException($slug);
        }

        return $tenant['id'];
    }
}
