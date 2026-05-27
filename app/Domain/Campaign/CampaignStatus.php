<?php

declare(strict_types=1);

namespace App\Domain\Campaign;

final class CampaignStatus
{
    private const OPEN   = 'open';
    private const CLOSED = 'closed';
    private const VALID  = [self::OPEN, self::CLOSED];

    private function __construct(private readonly string $value) {}

    public static function open(): self
    {
        return new self(self::OPEN);
    }

    public static function closed(): self
    {
        return new self(self::CLOSED);
    }

    public static function fromString(string $value): self
    {
        if (!in_array($value, self::VALID, true)) {
            throw new \InvalidArgumentException("Invalid CampaignStatus: '{$value}'. Must be 'open' or 'closed'.");
        }
        return new self($value);
    }

    public function isOpen(): bool
    {
        return $this->value === self::OPEN;
    }

    public function isClosed(): bool
    {
        return $this->value === self::CLOSED;
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function value(): string
    {
        return $this->value;
    }
}
