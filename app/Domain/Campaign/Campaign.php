<?php

declare(strict_types=1);

namespace App\Domain\Campaign;

use App\Domain\Shared\Money;
use App\Domain\Shared\TenantId;
use App\Domain\Shared\TenantMismatchException;

final class Campaign
{
    /** @var Donation[] */
    private array $donations = [];

    private function __construct(
        private readonly CampaignId        $id,
        private readonly TenantId          $tenantId,
        private readonly CampaignName      $name,
        private readonly Money             $goal,
        private Money                      $raised,
        private CampaignStatus             $status,
        private readonly \DateTimeImmutable $deadline
    ) {}

    public static function create(
        CampaignId $id,
        TenantId $tenantId,
        CampaignName $name,
        Money $goal,
        \DateTimeImmutable $deadline
    ): self {
        $tomorrow = (new \DateTimeImmutable('tomorrow'))->format('Y-m-d');
        if ($deadline->format('Y-m-d') < $tomorrow) {
            throw new \InvalidArgumentException('Campaign deadline must be at least one day in the future.');
        }

        return new self(
            $id,
            $tenantId,
            $name,
            $goal,
            Money::zero($goal->currency()),
            CampaignStatus::open(),
            $deadline
        );
    }

    public static function reconstitute(
        CampaignId $id,
        TenantId $tenantId,
        CampaignName $name,
        Money $goal,
        Money $raised,
        CampaignStatus $status,
        \DateTimeImmutable $deadline,
        array $donations = []
    ): self {
        $campaign = new self($id, $tenantId, $name, $goal, $raised, $status, $deadline);
        $campaign->donations = $donations;
        return $campaign;
    }

    public function recordDonation(
        DonationId $id,
        TenantId $tenantId,
        DonorName $donorName,
        Money $amount
    ): void {
        $this->guardTenant($tenantId);
        $this->guardOpen();
        $this->raised      = $this->raised->add($amount);
        $this->donations[] = new Donation($id, $donorName, $amount, new \DateTimeImmutable());
    }

    public function close(TenantId $tenantId): void
    {
        $this->guardTenant($tenantId);
        $this->guardGoalReached();
        $this->guardDeadlinePassed();
        $this->status = CampaignStatus::closed();
    }

    public function forceClose(TenantId $tenantId): void
    {
        $this->guardTenant($tenantId);
        $this->guardOpen();
        $this->status = CampaignStatus::closed();
    }

    // --- Guards ---

    private function guardTenant(TenantId $tenantId): void
    {
        if (!$this->tenantId->equals($tenantId)) {
            throw new TenantMismatchException();
        }
    }

    private function guardOpen(): void
    {
        if ($this->status->isClosed()) {
            throw new \DomainException('Cannot modify a closed campaign.');
        }
    }

    private function guardGoalReached(): void
    {
        if (!$this->raised->isGreaterThanOrEqual($this->goal)) {
            throw new \DomainException('Campaign goal has not been reached.');
        }
    }

    private function guardDeadlinePassed(): void
    {
        if (new \DateTimeImmutable() < $this->deadline) {
            throw new \DomainException('Campaign deadline has not passed yet.');
        }
    }

    // --- Accessors ---

    public function id(): CampaignId
    {
        return $this->id;
    }

    public function tenantId(): TenantId
    {
        return $this->tenantId;
    }

    public function name(): CampaignName
    {
        return $this->name;
    }

    public function goal(): Money
    {
        return $this->goal;
    }

    public function raised(): Money
    {
        return $this->raised;
    }

    public function status(): CampaignStatus
    {
        return $this->status;
    }

    public function deadline(): \DateTimeImmutable
    {
        return $this->deadline;
    }

    /** @return Donation[] */
    public function donations(): array
    {
        return $this->donations;
    }
}
