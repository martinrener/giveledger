<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Controller\Campaign;

use App\Application\Campaign\CloseCampaignCommand;
use App\Application\Campaign\CreateCampaignCommand;
use App\Infrastructure\Application\HandlerBus;
use App\Infrastructure\Query\CampaignFinder;
use Ramsey\Uuid\Uuid;

final class CampaignController
{
    public function __construct(
        private readonly HandlerBus     $bus,
        private readonly CampaignFinder $campaignFinder
    ) {}

    public function index(array $body, array $params, ?string $tenantId): array
    {
        return [200, $this->campaignFinder->allForTenant($tenantId)];
    }

    public function store(array $body, array $params, ?string $tenantId): array
    {
        $this->bus->dispatch(new CreateCampaignCommand(
            tenantId:   $tenantId,
            campaignId: Uuid::uuid4()->toString(),
            name:       $body['name'] ?? '',
            goalCents:  (int) ($body['goal_cents'] ?? 0),
            currency:   $body['currency'] ?? '',
            deadline:   $body['deadline'] ?? '',
        ));

        return [201, null];
    }

    public function close(array $body, array $params, ?string $tenantId): array
    {
        $this->bus->dispatch(new CloseCampaignCommand(
            tenantId:   $tenantId,
            campaignId: $params['campaignId'],
        ));

        return [200, null];
    }
}
