<?php

declare(strict_types=1);

namespace App\Domain\Campaign;

use App\Domain\Shared\Money;

final class Donation
{
    private function __construct(
        private readonly DonationId        $id,
        private readonly DonorName         $donorName,
        private readonly Money             $amount,
        private readonly \DateTimeImmutable $recordedAt
    ) {}

    public static function create(
        DonationId $id,
        DonorName $donorName,
        Money $amount,
        \DateTimeImmutable $recordedAt
    ): self {
        return new self($id, $donorName, $amount, $recordedAt);
    }

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
