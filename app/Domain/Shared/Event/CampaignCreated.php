<?php

declare(strict_types=1);

namespace App\Domain\Shared\Event;

final class CampaignCreated
{
    public function __construct(
        public readonly string $tenantId,
        public readonly string $campaignId,
        public readonly string $name,
        public readonly int $goalCents,
        public readonly string $currency,
        public readonly string $deadline,
    ) {}
}
