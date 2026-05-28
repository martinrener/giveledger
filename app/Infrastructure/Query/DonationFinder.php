<?php

declare(strict_types=1);

namespace App\Infrastructure\Query;

final class DonationFinder
{
    public function __construct(private readonly \PDO $pdo) {}

    /** @return array<int, array<string, mixed>> */
    public function allForTenant(string $tenantId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT d.id, d.campaign_id, d.donor_name, d.amount_cents, d.recorded_at
             FROM donations d
             INNER JOIN campaigns c ON c.id = d.campaign_id
             WHERE c.tenant_id = :tenant_id
             ORDER BY d.recorded_at DESC'
        );

        $stmt->execute(['tenant_id' => $tenantId]);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
