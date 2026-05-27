<?php

declare(strict_types=1);

namespace App\Domain\Shared;

final class Money
{
    private const ALLOWED_CURRENCIES = ['USD', 'EUR', 'GBP', 'ARS', 'UYU'];

    private function __construct(
        private readonly int $cents,
        private readonly string $currency
    ) {}

    public static function of(int $cents, string $currency): self
    {
        if ($cents <= 0) {
            throw new \InvalidArgumentException("Money amount must be > 0, got: {$cents}");
        }
        $upper = strtoupper($currency);
        if (!in_array($upper, self::ALLOWED_CURRENCIES, true)) {
            throw new \InvalidArgumentException("Unknown currency: {$currency}");
        }
        return new self($cents, $upper);
    }

    public static function zero(string $currency): self
    {
        $upper = strtoupper($currency);
        if (!in_array($upper, self::ALLOWED_CURRENCIES, true)) {
            throw new \InvalidArgumentException("Unknown currency: {$currency}");
        }
        return new self(0, $upper);
    }

    public function toCents(): int
    {
        return $this->cents;
    }

    public function currency(): string
    {
        return $this->currency;
    }

    public function format(): string
    {
        return number_format($this->cents / 100, 2) . ' ' . $this->currency;
    }

    public function equals(self $other): bool
    {
        return $this->cents === $other->cents && $this->currency === $other->currency;
    }

    public function add(self $other): self
    {
        if ($this->currency !== $other->currency) {
            throw new \InvalidArgumentException("Cannot add different currencies: {$this->currency} and {$other->currency}");
        }
        return new self($this->cents + $other->cents, $this->currency);
    }

    public function isGreaterThanOrEqual(self $other): bool
    {
        return $this->cents >= $other->cents;
    }
}
