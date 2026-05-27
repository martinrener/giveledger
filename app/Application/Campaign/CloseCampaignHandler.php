<?php

declare(strict_types=1);

namespace App\Application\Campaign;

use App\Domain\Campaign\CampaignId;
use App\Domain\Campaign\CampaignNotFoundException;
use App\Domain\Campaign\CampaignRepositoryInterface;
use App\Domain\Shared\TenantId;

final class CloseCampaignHandler
{
    public function __construct(
        private readonly CampaignRepositoryInterface $campaigns
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
    }
}
