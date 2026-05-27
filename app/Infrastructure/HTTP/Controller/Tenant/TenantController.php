<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Controller\Tenant;

use App\Infrastructure\Query\TenantFinder;

final class TenantController
{
    public function __construct(private readonly TenantFinder $tenantFinder) {}

    public function index(array $body, array $params, ?string $tenantId): array
    {
        return [200, $this->tenantFinder->all()];
    }
}
