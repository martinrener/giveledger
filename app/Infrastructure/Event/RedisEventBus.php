<?php

declare(strict_types=1);

namespace App\Infrastructure\Event;

use App\Domain\Shared\EventBusInterface;
use App\Domain\Shared\Event\DonationRecorded;
use App\Domain\Shared\Event\CampaignClosed;
use App\Domain\Shared\Event\CampaignCreated;

final class RedisEventBus implements EventBusInterface
{
    public function __construct(private readonly \Redis $redis) {}

    public function publish(object $event): void
    {
        try {
            $tenantId = match (true) {
                $event instanceof DonationRecorded => $event->tenantId,
                $event instanceof CampaignClosed   => $event->tenantId,
                $event instanceof CampaignCreated  => $event->tenantId,
                default => null,
            };

            if ($tenantId === null) {
                return;
            }

            $channel = "tenant:{$tenantId}";
            $payload = json_encode([
                'type' => (new \ReflectionClass($event))->getShortName(),
                'data' => (array) $event,
            ], JSON_THROW_ON_ERROR);

            $this->redis->publish($channel, $payload);
        } catch (\Throwable $e) {
            error_log('[RedisEventBus] Failed to publish event: ' . $e->getMessage());
        }
    }
}
