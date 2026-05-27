<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Controller\Stream;

final class StreamController
{
    public function __construct(private readonly \Redis $redis) {}

    public function stream(array $_body, array $params, ?string $tenantId): never
    {
        if (!$this->redis->isConnected()) {
            http_response_code(503);
            exit;
        }

        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no');

        $channel = "tenant:{$tenantId}";

        $this->redis->subscribe([$channel], function (\Redis $_redis, string $_channel, string $message): void {
            echo "data: {$message}\n\n";
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        });

        exit;
    }
}
