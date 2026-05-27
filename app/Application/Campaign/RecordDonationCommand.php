<?php

declare(strict_types=1);

namespace App\Application\Campaign;

final class RecordDonationCommand
{
    public function __construct(
        public readonly string $tenantId,
        public readonly string $campaignId,
        public readonly string $donationId,
        public readonly string $donorName,
        public readonly int    $amountCents,
        public readonly string $currency
    ) {}
}
