<?php

declare(strict_types=1);

use App\Application\Auth\LoginCommand;
use App\Application\Auth\LoginHandler;
use App\Application\Auth\RegisterUserCommand;
use App\Application\Auth\RegisterUserHandler;
use App\Application\Campaign\CloseCampaignCommand;
use App\Application\Campaign\CloseCampaignHandler;
use App\Application\Campaign\CreateCampaignCommand;
use App\Application\Campaign\CreateCampaignHandler;
use App\Application\Campaign\RecordDonationCommand;
use App\Application\Campaign\RecordDonationHandler;
use App\Infrastructure\Domain\CampaignRepository;
use App\Infrastructure\Domain\TokenStorage;
use App\Infrastructure\Domain\UserRepository;
use App\Infrastructure\Event\NullEventBus;
use App\Infrastructure\Event\RedisEventBus;

return [
    CreateCampaignCommand::class  => fn(\PDO $pdo, ?\Redis $redis) => new CreateCampaignHandler(
        new CampaignRepository($pdo),
        $redis !== null ? new RedisEventBus($redis) : new NullEventBus()
    ),
    RecordDonationCommand::class  => fn(\PDO $pdo, ?\Redis $redis) => new RecordDonationHandler(
        new CampaignRepository($pdo),
        $redis !== null ? new RedisEventBus($redis) : new NullEventBus()
    ),
    CloseCampaignCommand::class   => fn(\PDO $pdo, ?\Redis $redis) => new CloseCampaignHandler(
        new CampaignRepository($pdo),
        $redis !== null ? new RedisEventBus($redis) : new NullEventBus()
    ),
    RegisterUserCommand::class    => fn(\PDO $pdo, ?\Redis $_redis) => new RegisterUserHandler(new UserRepository($pdo)),
    LoginCommand::class           => fn(\PDO $pdo, ?\Redis $_redis) => new LoginHandler(new UserRepository($pdo), new TokenStorage($pdo)),
];
