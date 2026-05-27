# Backend Skill — DDD & Hexagonal Architecture (PHP)

Reference for all backend patterns in GiveLedger. PHP 8.3, pure PDO, no frameworks in Domain/.

---

## Layer Rules (repeat before every file you create)

| Layer | Contains | Imports allowed |
|-------|----------|-----------------|
| Domain | VOs, Entities, Aggregates, Repository interfaces | Nothing external |
| Application | Commands (DTOs), Handlers | Domain only |
| Infrastructure | PDO repos, HTTP controllers, HandlerBus, Finder | Anything |

---

## Value Object Pattern

```php
final class CampaignName
{
    private function __construct(private readonly string $value) {}

    public static function of(string $value): self
    {
        $trimmed = trim($value);
        if (strlen($trimmed) < 3 || strlen($trimmed) > 100) {
            throw new \InvalidArgumentException("CampaignName must be 3–100 chars, got: '{$trimmed}'");
        }
        return new self($trimmed);
    }

    public function equals(self $other): bool { return $this->value === $other->value; }
    public function value(): string { return $this->value; }
}
```

**Rules:**
- `final` class — no subclassing
- `private` constructor — always use named static factory `of()`
- Validate in constructor body, throw `\InvalidArgumentException` with descriptive message
- Never mutate — return new instance if transformation needed
- `equals()` compares by value, not reference

---

## UUID Value Object Pattern

```php
final class CampaignId
{
    private function __construct(private readonly string $value) {}

    public static function of(string $value): self
    {
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $value)) {
            throw new \InvalidArgumentException("Invalid UUID v4: {$value}");
        }
        return new self($value);
    }

    public function equals(self $other): bool { return $this->value === $other->value; }
    public function value(): string { return $this->value; }
}
```

---

## Money Value Object

```php
final class Money
{
    private function __construct(
        private readonly int $cents,
        private readonly string $currency
    ) {}

    public static function of(int $cents, string $currency): self
    {
        if ($cents <= 0) {
            throw new \InvalidArgumentException("Money amount must be > 0, got: {$cents}");
        }
        $allowed = ['USD', 'EUR', 'GBP', 'ARS', 'UYU'];
        if (!in_array(strtoupper($currency), $allowed, true)) {
            throw new \InvalidArgumentException("Unknown currency: {$currency}");
        }
        return new self($cents, strtoupper($currency));
    }

    public function toCents(): int { return $this->cents; }
    public function currency(): string { return $this->currency; }
    public function format(): string { return number_format($this->cents / 100, 2) . ' ' . $this->currency; }
    public function equals(self $other): bool { return $this->cents === $other->cents && $this->currency === $other->currency; }

    public function add(self $other): self
    {
        if ($this->currency !== $other->currency) {
            throw new \InvalidArgumentException("Cannot add different currencies");
        }
        return new self($this->cents + $other->cents, $this->currency);
    }

    public function isGreaterThanOrEqual(self $other): bool { return $this->cents >= $other->cents; }
}
```

---

## CampaignStatus — Enum-style VO

```php
final class CampaignStatus
{
    private const OPEN   = 'open';
    private const CLOSED = 'closed';
    private const VALID  = [self::OPEN, self::CLOSED];

    private function __construct(private readonly string $value) {}

    public static function open(): self   { return new self(self::OPEN); }
    public static function closed(): self { return new self(self::CLOSED); }

    public static function fromString(string $value): self
    {
        if (!in_array($value, self::VALID, true)) {
            throw new \InvalidArgumentException("Invalid status: {$value}");
        }
        return new self($value);
    }

    public function isOpen(): bool   { return $this->value === self::OPEN; }
    public function isClosed(): bool { return $this->value === self::CLOSED; }
    public function value(): string  { return $this->value; }
}
```

---

## Aggregate Root Pattern — Campaign

```php
class Campaign
{
    private array $donations = [];

    private function __construct(
        private CampaignId        $id,
        private TenantId          $tenantId,
        private CampaignName      $name,
        private Money             $goal,
        private Money             $raised,
        private CampaignStatus    $status,
        private \DateTimeImmutable $deadline
    ) {}

    public static function create(
        CampaignId $id, TenantId $tenantId, CampaignName $name,
        Money $goal, \DateTimeImmutable $deadline
    ): self {
        $zero = Money::of(1, $goal->currency()); // placeholder — raised starts at 0
        // Note: create a Money::zero() factory for real impl
        return new self($id, $tenantId, $name, $goal, $zero, CampaignStatus::open(), $deadline);
    }

    public function recordDonation(
        DonationId $id, TenantId $tenantId, DonorName $donor, Money $amount
    ): void {
        $this->guardTenant($tenantId);
        $this->guardOpen();
        $this->raised      = $this->raised->add($amount);
        $this->donations[] = new Donation($id, $donor, $amount, new \DateTimeImmutable());
    }

    public function close(TenantId $tenantId): void
    {
        $this->guardTenant($tenantId);
        $this->guardGoalReached();
        $this->guardDeadlinePassed();
        $this->status = CampaignStatus::closed();
    }

    // --- Guards ---
    private function guardTenant(TenantId $t): void
    {
        if (!$this->tenantId->equals($t)) {
            throw new TenantMismatchException();
        }
    }

    private function guardOpen(): void
    {
        if ($this->status->isClosed()) {
            throw new \DomainException("Cannot modify a closed campaign.");
        }
    }

    private function guardGoalReached(): void
    {
        if (!$this->raised->isGreaterThanOrEqual($this->goal)) {
            throw new \DomainException("Campaign goal has not been reached.");
        }
    }

    private function guardDeadlinePassed(): void
    {
        if (new \DateTimeImmutable() < $this->deadline) {
            throw new \DomainException("Campaign deadline has not passed yet.");
        }
    }

    // --- Accessors (for hydration/persistence) ---
    public function id(): CampaignId            { return $this->id; }
    public function tenantId(): TenantId        { return $this->tenantId; }
    public function name(): CampaignName        { return $this->name; }
    public function goal(): Money               { return $this->goal; }
    public function raised(): Money             { return $this->raised; }
    public function status(): CampaignStatus    { return $this->status; }
    public function deadline(): \DateTimeImmutable { return $this->deadline; }
    public function donations(): array          { return $this->donations; }
}
```

---

## Command Pattern

```php
// Commands: final, public readonly fields, primitives only
final class CreateCampaignCommand
{
    public function __construct(
        public readonly string $tenantId,
        public readonly string $campaignId,
        public readonly string $name,
        public readonly int    $goalCents,
        public readonly string $currency,
        public readonly string $deadline   // ISO date string: "2025-12-31"
    ) {}
}
```

---

## Handler Pattern

```php
final class CreateCampaignHandler
{
    public function __construct(
        private CampaignRepositoryInterface $campaigns
    ) {}

    public function handle(CreateCampaignCommand $cmd): void
    {
        // Handler builds all VOs from primitives
        $campaign = Campaign::create(
            CampaignId::of($cmd->campaignId),
            TenantId::of($cmd->tenantId),
            CampaignName::of($cmd->name),
            Money::of($cmd->goalCents, $cmd->currency),
            new \DateTimeImmutable($cmd->deadline)
        );

        $this->campaigns->save($campaign);
    }
}
```

---

## Repository Interface (Domain) + Implementation (Infrastructure)

```php
// Domain/Campaign/CampaignRepositoryInterface.php
interface CampaignRepositoryInterface
{
    public function findById(CampaignId $id, TenantId $tenantId): ?Campaign;
    public function save(Campaign $campaign): void;
}

// Infrastructure/Domain/CampaignRepository.php
final class CampaignRepository implements CampaignRepositoryInterface
{
    public function __construct(private \PDO $pdo) {}

    public function findById(CampaignId $id, TenantId $tenantId): ?Campaign
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM campaigns WHERE id = :id AND tenant_id = :tid LIMIT 1'
        );
        $stmt->execute(['id' => $id->value(), 'tid' => $tenantId->value()]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $row ? $this->hydrate($row) : null;
    }

    public function save(Campaign $campaign): void
    {
        // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert
        $stmt = $this->pdo->prepare(
            'INSERT INTO campaigns (id, tenant_id, name, goal_cents, currency, status, deadline)
             VALUES (:id, :tid, :name, :goal, :currency, :status, :deadline)
             ON DUPLICATE KEY UPDATE name=:name, goal_cents=:goal, status=:status'
        );
        $stmt->execute([
            'id'       => $campaign->id()->value(),
            'tid'      => $campaign->tenantId()->value(),
            'name'     => $campaign->name()->value(),
            'goal'     => $campaign->goal()->toCents(),
            'currency' => $campaign->goal()->currency(),
            'status'   => $campaign->status()->value(),
            'deadline' => $campaign->deadline()->format('Y-m-d'),
        ]);
    }

    private function hydrate(array $row): Campaign { /* reconstruct from DB row */ }
}
```

**Rules:**
- Every SQL query uses named placeholders — zero string interpolation
- `tenant_id` condition on every query that reads/writes tenant data
- `hydrate()` reconstructs the aggregate from a DB row using VOs

---

## Finder Pattern (Infrastructure/Query)

```php
final class CampaignFinder
{
    public function __construct(private \PDO $pdo) {}

    /** @return array<int, array<string, mixed>> */
    public function allForTenant(string $tenantId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT c.id, c.name, c.goal_cents, c.currency, c.status, c.deadline,
                    COALESCE(SUM(d.amount_cents), 0) AS raised_cents
             FROM campaigns c
             LEFT JOIN donations d ON d.campaign_id = c.id
             WHERE c.tenant_id = :tid
             GROUP BY c.id
             ORDER BY c.created_at DESC'
        );
        $stmt->execute(['tid' => $tenantId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
```

Finders receive raw `string $tenantId` (not VO) — they are read-only, already past domain validation.

---

## HandlerBus

```php
final class HandlerBus
{
    private array $map;

    public function __construct(private \Psr\Container\ContainerInterface $container)
    {
        $this->map = require __DIR__ . '/../../../config/handlers.php';
    }

    public function dispatch(object $command): void
    {
        $class = get_class($command);
        if (!isset($this->map[$class])) {
            throw new \RuntimeException("No handler for command: {$class}");
        }
        $handler = $this->container->get($this->map[$class]);
        $handler->handle($command);
    }
}
```

---

## Controller Pattern

```php
final class CampaignController
{
    public function __construct(
        private HandlerBus     $bus,
        private TenantResolver $resolver,
        private CampaignFinder $finder
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->resolver->resolve($request);
        return new JsonResponse($this->finder->allForTenant($tenantId));
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->resolver->resolve($request);
        $body     = $request->getParsedBody();

        $this->bus->dispatch(new CreateCampaignCommand(
            tenantId:   $tenantId,
            campaignId: \Ramsey\Uuid\Uuid::uuid4()->toString(),
            name:       $body['name'],
            goalCents:  (int) $body['goal_cents'],
            currency:   $body['currency'],
            deadline:   $body['deadline'],
        ));

        return new JsonResponse(null, 201);
    }
}
```

Controller rules: resolve tenant → build command → dispatch. No domain logic, no VO construction.

---

## TenantResolver

```php
final class TenantResolver
{
    public function __construct(private \PDO $pdo) {}

    public function resolve(\Psr\Http\Message\ServerRequestInterface $request): string
    {
        $header = $request->getHeaderLine('X-Tenant-ID');
        $host   = $request->getHeaderLine('Host');
        $parts  = explode('.', $host);
        $slug   = count($parts) >= 3 ? $parts[0] : null;

        $tenantId = $header ?: $this->lookupSlug($slug);

        if ($tenantId === null) {
            throw new TenantNotFoundException(); // caught by error handler → 404
        }

        return $tenantId;
    }
}
```

---

## config/handlers.php

```php
<?php

use App\Application\Campaign\CreateCampaignCommand;
use App\Application\Campaign\CreateCampaignHandler;
use App\Application\Campaign\RecordDonationCommand;
use App\Application\Campaign\RecordDonationHandler;
use App\Application\Campaign\CloseCampaignCommand;
use App\Application\Campaign\CloseCampaignHandler;

return [
    CreateCampaignCommand::class  => CreateCampaignHandler::class,
    RecordDonationCommand::class  => RecordDonationHandler::class,
    CloseCampaignCommand::class   => CloseCampaignHandler::class,
];
```

---

## Golden Rules — Quick Check Before Every File

1. Am I in `Domain/`? → zero `use` statements with external packages
2. Is this a Command? → all fields must be `string`, `int`, or `bool`
3. Is this a Handler? → must wrap primitives into VOs, never the controller
4. Is this a Finder? → must return plain arrays, never entities
5. Is this a Repository? → all SQL uses named placeholders, `tenant_id` on every query
6. Is this a VO? → `final`, `private __construct`, static factory `of()`, throws on invalid input
