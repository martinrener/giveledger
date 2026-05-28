<?php

declare(strict_types=1);

namespace App\Infrastructure\Api\Resource;

final class CampaignResource
{
    /**
     * @param array<int, array<string, mixed>> $campaigns  rows from CampaignFinder
     * @param array<int, array<string, mixed>> $donations  rows from DonationFinder
     * @return array<int, array<string, mixed>>
     */
    public static function collection(array $campaigns, array $donations): array
    {
        $grouped = [];
        foreach ($donations as $donation) {
            $grouped[(string) $donation['campaign_id']][] = self::donationRow($donation);
        }

        return array_values(array_map(
            fn(array $row) => self::fromRow($row, $grouped[$row['id']] ?? []),
            $campaigns
        ));
    }

    /** @param array<int, array<string, mixed>> $donations */
    public static function fromRow(array $row, array $donations = []): array
    {
        return [
            'id'          => $row['id'],
            'name'        => $row['name'],
            'goalCents'   => (int) $row['goal_cents'],
            'raisedCents' => (int) $row['raised_cents'],
            'currency'    => $row['currency'],
            'status'      => $row['status'],
            'deadline'    => $row['deadline'],
            'donations'   => $donations,
        ];
    }

    /** @param array<string, mixed> $row */
    private static function donationRow(array $row): array
    {
        return [
            'id'          => $row['id'],
            'campaignId'  => $row['campaign_id'],
            'donorName'   => $row['donor_name'],
            'amountCents' => (int) $row['amount_cents'],
            'recordedAt'  => $row['recorded_at'],
        ];
    }
}
