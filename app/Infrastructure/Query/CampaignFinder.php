<?php

declare(strict_types=1);

namespace App\Infrastructure\Query;

final class CampaignFinder
{
    public function __construct(private readonly \PDO $pdo) {}

    /** All campaigns for a tenant (admin view). */
    public function allForTenant(string $tenantId): array
    {
        return $this->queryAll($tenantId, false);
    }

    /** Only open campaigns for a tenant (public view). */
    public function allOpenForTenant(string $tenantId): array
    {
        return $this->queryAll($tenantId, true);
    }

    public function findById(string $campaignId, string $tenantId): ?array
    {
        $this->autoClose($tenantId);

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

    private function queryAll(string $tenantId, bool $onlyOpen): array
    {
        $this->autoClose($tenantId);

        $statusClause = $onlyOpen ? "AND c.status = 'open'" : '';

        $query = $this->pdo->prepare(
            "SELECT c.id, c.name, c.goal_cents, c.currency, c.status, c.deadline,
                    COALESCE(SUM(d.amount_cents), 0) AS raised_cents
             FROM campaigns c
             LEFT JOIN donations d ON d.campaign_id = c.id
             WHERE c.tenant_id = :tenant_id {$statusClause}
             GROUP BY c.id
             ORDER BY c.created_at DESC"
        );

        $query->execute(['tenant_id' => $tenantId]);

        return $query->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function autoClose(string $tenantId): void
    {
        $stmt = $this->pdo->prepare(
            "UPDATE campaigns
             SET status = 'closed'
             WHERE tenant_id = :tenant_id
               AND status    = 'open'
               AND (
                 deadline < CURDATE()
                 OR goal_cents <= (
                   SELECT COALESCE(SUM(d.amount_cents), 0)
                   FROM donations d
                   WHERE d.campaign_id = campaigns.id
                 )
               )"
        );

        $stmt->execute(['tenant_id' => $tenantId]);
    }
}
