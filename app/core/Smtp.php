<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;

/**
 * A small SMTP client: SSL (port 465) or STARTTLS (587), AUTH LOGIN, one
 * message per connection. Certificates are verified. Throws RuntimeException
 * with the server's reply when anything fails, so the mail queue can record it.
 */
final class Smtp
{
    private $sock;

    public function __construct(
        private string $host,
        private int $port,
        private string $secure,          // ssl | tls | none
        private string $user = '',
        private string $pass = '',
        private int $timeout = 10,
    ) {
    }

    /** Sends a complete message (headers + body, CRLF line ends). */
    public function send(string $from, string $to, string $message): void
    {
        $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'peer_name' => $this->host]]);
        $remote = ($this->secure === 'ssl' ? 'ssl://' : 'tcp://') . $this->host . ':' . $this->port;
        $this->sock = @stream_socket_client($remote, $errno, $errstr, $this->timeout, STREAM_CLIENT_CONNECT, $ctx);
        if (!$this->sock) {
            throw new RuntimeException("SMTP connect to {$this->host}:{$this->port} failed: $errstr ($errno)");
        }
        stream_set_timeout($this->sock, $this->timeout);
        try {
            $this->expect([220]);
            $helo = gethostname() ?: 'localhost';
            $this->cmd("EHLO $helo", [250]);
            if ($this->secure === 'tls') {
                $this->cmd('STARTTLS', [220]);
                if (!stream_socket_enable_crypto($this->sock, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
                    throw new RuntimeException('SMTP STARTTLS failed');
                }
                $this->cmd("EHLO $helo", [250]);
            }
            if ($this->user !== '') {
                $this->cmd('AUTH LOGIN', [334]);
                $this->cmd(base64_encode($this->user), [334]);
                $this->cmd(base64_encode($this->pass), [235], 'AUTH (password hidden)');
            }
            $this->cmd("MAIL FROM:<$from>", [250]);
            $this->cmd("RCPT TO:<$to>", [250, 251]);
            $this->cmd('DATA', [354]);
            // lines starting with a dot are doubled (RFC 5321 §4.5.2)
            $data = preg_replace('/^\./m', '..', str_replace(["\r\n", "\r"], "\n", $message));
            $this->write(str_replace("\n", "\r\n", rtrim($data, "\n")) . "\r\n.");
            $this->expect([250]);
            $this->cmd('QUIT', [221]);
        } finally {
            fclose($this->sock);
        }
    }

    private function cmd(string $line, array $codes, ?string $shown = null): void
    {
        $this->write($line);
        $this->expect($codes, $shown ?? (str_starts_with($line, 'AUTH') ? $line : explode(' ', $line)[0]));
    }

    private function write(string $line): void
    {
        if (fwrite($this->sock, $line . "\r\n") === false) {
            throw new RuntimeException('SMTP write failed');
        }
    }

    /** Reads a (multi-line) reply and checks its code. */
    private function expect(array $codes, string $after = 'connect'): void
    {
        $reply = '';
        while (($line = fgets($this->sock, 1024)) !== false) {
            $reply .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        $code = (int) substr($reply, 0, 3);
        if (!in_array($code, $codes, true)) {
            $meta = stream_get_meta_data($this->sock);
            throw new RuntimeException("SMTP $after: " . ($meta['timed_out'] ? 'timed out' : (trim($reply) ?: 'no reply')));
        }
    }
}
