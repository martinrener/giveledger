<?php

declare(strict_types=1);

namespace App\Domain\Campaign;

use App\Domain\Shared\Money;

final class Donation
{
    public function __construct(
        private readonly DonationId        $id,
        private readonly DonorName         $donorName,
        private readonly Money             $amount,
        private readonly \DateTimeImmutable $recordedAt
    ) {}

    public function id(): DonationId
    {
        return $this->id;
    }

    public function donorName(): DonorName
    {
        return $this->donorName;
    }

    public function amount(): Money
    {
        return $this->amount;
    }

    public function recordedAt(): \DateTimeImmutable
    {
        return $this->recordedAt;
    }
}
