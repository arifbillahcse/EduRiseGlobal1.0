<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Minimal router. Patterns use {name} placeholders that match one path
 * segment of letters, digits and dashes: '/study-in-{slug}'.
 */
final class Router
{
    /** @var array<int, array{0:string,1:string,2:callable}> */
    private array $routes = [];
    private $notFound;

    public function get(string $pattern, callable $handler): void
    {
        $this->routes[] = ['GET', $pattern, $handler];
    }

    public function post(string $pattern, callable $handler): void
    {
        $this->routes[] = ['POST', $pattern, $handler];
    }

    public function notFound(callable $handler): void
    {
        $this->notFound = $handler;
    }

    public function dispatch(string $method, string $path): void
    {
        $method = $method === 'HEAD' ? 'GET' : $method;
        $allowed = [];

        foreach ($this->routes as [$verb, $pattern, $handler]) {
            $regex = '#^' . preg_replace('#\\\{([a-z_]+)\\\}#', '(?P<$1>[a-z0-9-]+)', preg_quote($pattern, '#')) . '$#i';
            if (!preg_match($regex, $path, $m)) {
                continue;
            }
            if ($verb !== $method) {
                $allowed[] = $verb;
                continue;
            }
            $params = array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
            $handler(...$params);
            return;
        }

        if ($allowed) {
            http_response_code(405);
            header('Allow: ' . implode(', ', array_unique($allowed)));
            echo 'Method not allowed';
            return;
        }
        ($this->notFound)();
    }

    /** Request path without the site's base path, query string or trailing slash. */
    public static function currentPath(): string
    {
        $path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
        $base = base_path();
        if ($base !== '' && str_starts_with($path, $base)) {
            $path = substr($path, strlen($base));
        }
        $path = '/' . trim($path, '/');
        return $path;
    }
}
