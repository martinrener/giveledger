<?php

declare(strict_types=1);

namespace App\Application\Campaign;

final class CloseCampaignCommand
{
    public function __construct(
        public readonly string $tenantId,
        public readonly string $campaignId
    ) {}
}
