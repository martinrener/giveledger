<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Controller\Campaign;

use App\Application\Campaign\CloseCampaignCommand;
use App\Application\Campaign\CreateCampaignCommand;
use App\Infrastructure\Api\Resource\CampaignResource;
use App\Infrastructure\Application\HandlerBus;
use App\Infrastructure\Query\CampaignFinder;
use App\Infrastructure\Query\DonationFinder;
use Ramsey\Uuid\Uuid;

final class CampaignController
{
    public function __construct(
        private readonly HandlerBus     $bus,
        private readonly CampaignFinder $campaignFinder,
        private readonly DonationFinder $donationFinder,
    ) {}

    public function index(array $_body, array $_params, ?string $tenantId): array
    {
        $campaigns = $this->campaignFinder->allForTenant($tenantId);
        $donations  = $this->donationFinder->allForTenant($tenantId);

        return [200, CampaignResource::collection($campaigns, $donations)];
    }

    public function publicIndex(array $_body, array $_params, ?string $tenantId): array
    {
        $campaigns = $this->campaignFinder->allOpenForTenant($tenantId);
        $donations  = $this->donationFinder->allForTenant($tenantId);

        return [200, CampaignResource::collection($campaigns, $donations)];
    }

    public function store(array $body, array $_params, ?string $tenantId): array
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

    public function close(array $_body, array $params, ?string $tenantId): array
    {
        $this->bus->dispatch(new CloseCampaignCommand(
            tenantId:   $tenantId,
            campaignId: $params['campaignId'],
        ));

        return [200, null];
    }
}
