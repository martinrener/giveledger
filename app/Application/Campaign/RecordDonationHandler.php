<?php

declare(strict_types=1);

namespace App\Application\Campaign;

use App\Domain\Campaign\CampaignId;
use App\Domain\Campaign\CampaignNotFoundException;
use App\Domain\Campaign\CampaignRepositoryInterface;
use App\Domain\Campaign\DonationId;
use App\Domain\Campaign\DonorName;
use App\Domain\Shared\Money;
use App\Domain\Shared\TenantId;

final class RecordDonationHandler
{
    public function __construct(
        private readonly CampaignRepositoryInterface $campaigns
    ) {}

    public function __invoke(RecordDonationCommand $command): void
    {
        $tenantId   = TenantId::of($command->tenantId);
        $campaignId = CampaignId::of($command->campaignId);

        $campaign = $this->campaigns->findById($campaignId, $tenantId);

        if ($campaign === null) {
            throw new CampaignNotFoundException($command->campaignId);
        }

        $campaign->recordDonation(
            DonationId::of($command->donationId),
            $tenantId,
            DonorName::of($command->donorName),
            Money::of($command->amountCents, $command->currency)
        );

        $this->campaigns->save($campaign);
    }
}
