<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Controller\Donation;

use App\Application\Campaign\RecordDonationCommand;
use App\Infrastructure\Application\HandlerBus;
use Ramsey\Uuid\Uuid;

final class DonationController
{
    public function __construct(private readonly HandlerBus $bus) {}

    public function store(array $body, array $params, ?string $tenantId): array
    {
        $this->bus->dispatch(new RecordDonationCommand(
            tenantId:    $tenantId,
            campaignId:  $params['campaignId'],
            donationId:  Uuid::uuid4()->toString(),
            donorName:   $body['donor_name'] ?? '',
            amountCents: (int) ($body['amount_cents'] ?? 0),
            currency:    $body['currency'] ?? '',
        ));

        return [201, null];
    }
}
