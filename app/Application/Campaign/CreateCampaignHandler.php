<?php

declare(strict_types=1);

namespace App\Application\Campaign;

use App\Domain\Campaign\Campaign;
use App\Domain\Campaign\CampaignId;
use App\Domain\Campaign\CampaignName;
use App\Domain\Campaign\CampaignRepositoryInterface;
use App\Domain\Shared\Money;
use App\Domain\Shared\TenantId;

final class CreateCampaignHandler
{
    public function __construct(
        private readonly CampaignRepositoryInterface $campaigns
    ) {}

    public function __invoke(CreateCampaignCommand $command): void
    {
        $campaign = Campaign::create(
            CampaignId::of($command->campaignId),
            TenantId::of($command->tenantId),
            CampaignName::of($command->name),
            Money::of($command->goalCents, $command->currency),
            new \DateTimeImmutable($command->deadline)
        );

        $this->campaigns->save($campaign);
    }
}
