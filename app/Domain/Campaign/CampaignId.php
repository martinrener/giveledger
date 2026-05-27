<?php

declare(strict_types=1);

namespace App\Domain\Campaign;

final class CampaignId
{
    private function __construct(private readonly string $value) {}

    public static function of(string $value): self
    {
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $value)) {
            throw new \InvalidArgumentException("Invalid UUID v4 for CampaignId: {$value}");
        }
        return new self($value);
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
