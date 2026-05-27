<?php

declare(strict_types=1);

namespace App\Domain\Shared;

final class TenantMismatchException extends \DomainException
{
    public function __construct()
    {
        parent::__construct('Operation tenant does not match resource tenant.');
    }
}
