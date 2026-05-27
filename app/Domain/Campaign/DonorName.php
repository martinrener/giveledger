<?php

declare(strict_types=1);

namespace App\Domain\Campaign;

final class DonorName
{
    private function __construct(private readonly string $value) {}

    public static function of(string $value): self
    {
        $trimmed = trim($value);
        $length = strlen($trimmed);
        if ($length < 2 || $length > 80) {
            throw new \InvalidArgumentException("DonorName must be 2–80 chars, got: '{$trimmed}'");
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
