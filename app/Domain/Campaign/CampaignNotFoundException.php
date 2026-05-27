<?php

declare(strict_types=1);

namespace App\Domain\Campaign;

final class CampaignNotFoundException extends \DomainException
{
    public function __construct(string $campaignId)
    {
        parent::__construct("Campaign not found: {$campaignId}");
    }
}
