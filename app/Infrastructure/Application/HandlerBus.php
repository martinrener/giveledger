<?php

declare(strict_types=1);

namespace App\Infrastructure\Application;

final class HandlerBus
{
    private array $handlers;

    public function __construct(private readonly \PDO $pdo)
    {
        $this->handlers = require __DIR__ . '/../../../config/handlers.php';
    }

    public function dispatch(object $command): mixed
    {
        $class = get_class($command);

        if (!isset($this->handlers[$class])) {
            throw new \RuntimeException("No handler registered for command: {$class}");
        }

        $handler = ($this->handlers[$class])($this->pdo);

        return $handler($command);
    }
}
