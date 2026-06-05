<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Controller\Health;

final class HealthController
{
    public function ping(array $body, array $params, ?string $tenantId): array
    {
        return [200, ['status' => 'ok']];
    }
}
