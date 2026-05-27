<?php

declare(strict_types=1);

namespace App\Domain\Shared\Event;

final class CampaignClosed
{
    public function __construct(
        public readonly string $tenantId,
        public readonly string $campaignId,
    ) {}
}
