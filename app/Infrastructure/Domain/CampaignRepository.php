<?php

declare(strict_types=1);

namespace App\Infrastructure\Domain;

use App\Domain\Campaign\Campaign;
use App\Domain\Campaign\CampaignId;
use App\Domain\Campaign\CampaignName;
use App\Domain\Campaign\CampaignRepositoryInterface;
use App\Domain\Campaign\CampaignStatus;
use App\Domain\Shared\Money;
use App\Domain\Shared\TenantId;

final class CampaignRepository implements CampaignRepositoryInterface
{
    public function __construct(private readonly \PDO $pdo) {}

    public function findById(CampaignId $id, TenantId $tenantId): ?Campaign
    {
        $query = $this->pdo->prepare(
            'SELECT c.id, c.tenant_id, c.name, c.goal_cents, c.currency, c.status, c.deadline,
                    COALESCE(SUM(d.amount_cents), 0) AS raised_cents
             FROM campaigns c
             LEFT JOIN donations d ON d.campaign_id = c.id
             WHERE c.id = :id AND c.tenant_id = :tenant_id
             GROUP BY c.id'
        );

        $query->execute(['id' => $id->value(), 'tenant_id' => $tenantId->value()]);
        $row = $query->fetch(\PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function save(Campaign $campaign): void
    {
        $upsertCampaign = $this->pdo->prepare(
            'INSERT INTO campaigns (id, tenant_id, name, goal_cents, currency, status, deadline, created_at)
             VALUES (:id, :tenant_id, :name, :goal_cents, :currency, :status, :deadline, NOW())
             ON DUPLICATE KEY UPDATE name = VALUES(name), goal_cents = VALUES(goal_cents), status = VALUES(status)'
        );

        $upsertCampaign->execute([
            'id'         => $campaign->id()->value(),
            'tenant_id'  => $campaign->tenantId()->value(),
            'name'       => $campaign->name()->value(),
            'goal_cents' => $campaign->goal()->toCents(),
            'currency'   => $campaign->goal()->currency(),
            'status'     => $campaign->status()->value(),
            'deadline'   => $campaign->deadline()->format('Y-m-d'),
        ]);

        $insertDonation = $this->pdo->prepare(
            'INSERT INTO donations (id, campaign_id, donor_name, amount_cents, recorded_at)
             VALUES (:id, :campaign_id, :donor_name, :amount_cents, :recorded_at)'
        );

        foreach ($campaign->donations() as $donation) {
            $insertDonation->execute([
                'id'           => $donation->id()->value(),
                'campaign_id'  => $campaign->id()->value(),
                'donor_name'   => $donation->donorName()->value(),
                'amount_cents' => $donation->amount()->toCents(),
                'recorded_at'  => $donation->recordedAt()->format('Y-m-d H:i:s'),
            ]);
        }
    }

    private function hydrate(array $row): Campaign
    {
        $raisedCents = (int) $row['raised_cents'];

        return Campaign::reconstitute(
            CampaignId::of($row['id']),
            TenantId::of($row['tenant_id']),
            CampaignName::of($row['name']),
            Money::of((int) $row['goal_cents'], $row['currency']),
            $raisedCents > 0 ? Money::of($raisedCents, $row['currency']) : Money::zero($row['currency']),
            CampaignStatus::fromString($row['status']),
            new \DateTimeImmutable($row['deadline'])
        );
    }
}
