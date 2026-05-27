<?php

declare(strict_types=1);

namespace App\Domain\Campaign;

final class CampaignName
{
    private function __construct(private readonly string $value) {}

    public static function of(string $value): self
    {
        $trimmed = trim($value);
        $length = strlen($trimmed);
        if ($length < 3 || $length > 100) {
            throw new \InvalidArgumentException("CampaignName must be 3–100 chars, got: '{$trimmed}'");
        }
        return new self($trimmed);
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
