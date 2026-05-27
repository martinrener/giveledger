<?php

declare(strict_types=1);

namespace App\Infrastructure\Event;

use App\Domain\Shared\EventBusInterface;

final class NullEventBus implements EventBusInterface
{
    public function publish(object $event): void {}
}
