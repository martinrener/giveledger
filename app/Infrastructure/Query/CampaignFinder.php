<?php

declare(strict_types=1);

namespace App\Infrastructure\Query;

final class CampaignFinder
{
    public function __construct(private readonly \PDO $pdo) {}

    /** @return array<int, array<string, mixed>> */
    public function allForTenant(string $tenantId): array
    {
        $query = $this->pdo->prepare(
            'SELECT c.id, c.name, c.goal_cents, c.currency, c.status, c.deadline,
                    COALESCE(SUM(d.amount_cents), 0) AS raised_cents
             FROM campaigns c
             LEFT JOIN donations d ON d.campaign_id = c.id
             WHERE c.tenant_id = :tenant_id
             GROUP BY c.id
             ORDER BY c.created_at DESC'
        );

        $query->execute(['tenant_id' => $tenantId]);

        return $query->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findById(string $campaignId, string $tenantId): ?array
    {
        $query = $this->pdo->prepare(
            'SELECT c.id, c.name, c.goal_cents, c.currency, c.status, c.deadline,
                    COALESCE(SUM(d.amount_cents), 0) AS raised_cents
             FROM campaigns c
             LEFT JOIN donations d ON d.campaign_id = c.id
             WHERE c.id = :id AND c.tenant_id = :tenant_id
             GROUP BY c.id'
        );

        $query->execute(['id' => $campaignId, 'tenant_id' => $tenantId]);
        $row = $query->fetch(\PDO::FETCH_ASSOC);

        return $row ?: null;
    }
}
