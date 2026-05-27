<?php

declare(strict_types=1);

namespace App\Infrastructure\Query;

final class TenantFinder
{
    public function __construct(private readonly \PDO $pdo) {}

    public function findBySlug(string $slug): ?array
    {
        $query = $this->pdo->prepare(
            'SELECT id, slug, name FROM tenants WHERE slug = :slug LIMIT 1'
        );

        $query->execute(['slug' => $slug]);
        $row = $query->fetch(\PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    /** @return array<int, array<string, mixed>> */
    public function all(): array
    {
        $query = $this->pdo->prepare('SELECT id, slug, name FROM tenants ORDER BY name ASC');
        $query->execute();

        return $query->fetchAll(\PDO::FETCH_ASSOC);
    }
}
