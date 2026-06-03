<?php

declare(strict_types=1);

namespace App\Infrastructure\HTTP\Controller\Stream;

final class StreamController
{
    public function __construct(private readonly \Redis $redis) {}

    public function stream(array $_body, array $_params, ?string $tenantId): never
    {
        if ($tenantId === null || !$this->redis->isConnected()) {
            http_response_code(503);
            exit;
        }

        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no');

        // Without an initial echo+flush, PHP-FPM never commits the response
        // headers to nginx. The browser's EventSource stays in CONNECTING state
        // forever and onopen never fires.
        echo ": connected\n\n";
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();

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
