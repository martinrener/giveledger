<?php

declare(strict_types=1);

namespace App\Domain\Campaign;

use App\Domain\Shared\TenantId;

interface CampaignRepositoryInterface
{
    public function findById(CampaignId $id, TenantId $tenantId): ?Campaign;

    public function save(Campaign $campaign): void;
}
