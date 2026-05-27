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

return [
    CreateCampaignCommand::class  => fn(\PDO $pdo) => new CreateCampaignHandler(new CampaignRepository($pdo)),
    RecordDonationCommand::class  => fn(\PDO $pdo) => new RecordDonationHandler(new CampaignRepository($pdo)),
    CloseCampaignCommand::class   => fn(\PDO $pdo) => new CloseCampaignHandler(new CampaignRepository($pdo)),
    RegisterUserCommand::class    => fn(\PDO $pdo) => new RegisterUserHandler(new UserRepository($pdo)),
    LoginCommand::class           => fn(\PDO $pdo) => new LoginHandler(new UserRepository($pdo), new TokenStorage($pdo)),
];
