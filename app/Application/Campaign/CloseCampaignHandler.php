<?php

declare(strict_types=1);

namespace App\Application\Campaign;

use App\Domain\Campaign\CampaignId;
use App\Domain\Campaign\CampaignNotFoundException;
use App\Domain\Campaign\CampaignRepositoryInterface;
use App\Domain\Shared\EventBusInterface;
use App\Domain\Shared\Event\CampaignClosed;
use App\Domain\Shared\TenantId;

final class CloseCampaignHandler
{
    public function __construct(
        private readonly CampaignRepositoryInterface $campaigns,
        private readonly EventBusInterface $events,
    ) {}

    public function __invoke(CloseCampaignCommand $command): void
    {
        $tenantId   = TenantId::of($command->tenantId);
        $campaignId = CampaignId::of($command->campaignId);

        $campaign = $this->campaigns->findById($campaignId, $tenantId);

        if ($campaign === null) {
            throw new CampaignNotFoundException($command->campaignId);
        }

        $campaign->close($tenantId);

        $this->campaigns->save($campaign);

        $this->events->publish(new CampaignClosed(
            tenantId:   $command->tenantId,
            campaignId: $command->campaignId,
        ));
    }
}
