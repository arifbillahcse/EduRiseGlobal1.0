<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;

/**
 * Image uploads. Only JPEG, PNG and WebP up to 5 MB are accepted. Every image
 * is decoded and saved again with GD, which drops anything hidden in the file
 * (scripts, metadata, a second file type), and is given a random name in
 * public_html/uploads/YYYY/MM/. Images wider or taller than 2000 px are scaled down.
 */
final class Upload
{
    public const MAX_BYTES = 5 * 1024 * 1024;
    private const MAX_SIDE = 2000;
    private const TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

    /**
     * Saves one uploaded image and records it in the media table.
     * @param array $file one entry of $_FILES
     * @return array{id:int,path:string} path relative to public_html, e.g. uploads/2026/10/3f…a1.jpg
     * @throws RuntimeException with a message that can be shown to staff
     */
    public static function image(array $file, ?int $userId, string $alt = ''): array
    {
        $err = $file['error'] ?? UPLOAD_ERR_NO_FILE;
        if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) {
            throw new RuntimeException('The image is larger than 5 MB.');
        }
        if ($err !== UPLOAD_ERR_OK || !is_uploaded_file((string) ($file['tmp_name'] ?? ''))) {
            throw new RuntimeException('The upload did not arrive. Please try again.');
        }
        $tmp = $file['tmp_name'];
        if (filesize($tmp) > self::MAX_BYTES) {
            throw new RuntimeException('The image is larger than 5 MB.');
        }

        // the name must end in an image extension, and only one (shell.php.jpg is refused)
        $name = (string) ($file['name'] ?? '');
        if (!preg_match('/^[^.]+\.(jpe?g|png|webp)$/i', basename($name))) {
            throw new RuntimeException('Only JPG, PNG and WebP images can be uploaded (one file extension, e.g. photo.jpg).');
        }

        // the content must really be one of those image types
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($tmp) ?: '';
        $info = @getimagesize($tmp);
        if (!isset(self::TYPES[$mime]) || $info === false || $info['mime'] !== $mime) {
            throw new RuntimeException('That file is not a JPG, PNG or WebP image.');
        }
        [$w, $h] = $info;
        if ($w < 1 || $h < 1 || $w * $h > 40_000_000) {
            throw new RuntimeException('The image size is not supported.');
        }

        $img = match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($tmp),
            'image/png'  => @imagecreatefrompng($tmp),
            'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($tmp) : false,
        };
        if (!$img) {
            throw new RuntimeException('The image could not be read. Try saving it again as JPG.');
        }

        // scale down very large images
        if (max($w, $h) > self::MAX_SIDE) {
            $scale = self::MAX_SIDE / max($w, $h);
            $nw = max(1, (int) round($w * $scale));
            $nh = max(1, (int) round($h * $scale));
            $small = imagecreatetruecolor($nw, $nh);
            imagealphablending($small, false);
            imagesavealpha($small, true);
            imagecopyresampled($small, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
            imagedestroy($img);
            $img = $small;
            [$w, $h] = [$nw, $nh];
        }

        $ext = self::TYPES[$mime];
        if ($ext === 'webp' && !function_exists('imagewebp')) {
            $ext = 'jpg';
        }
        $rel = 'uploads/' . date('Y/m') . '/' . bin2hex(random_bytes(16)) . '.' . $ext;
        $abs = APP_ROOT . '/public_html/' . $rel;
        if (!is_dir(dirname($abs)) && !mkdir(dirname($abs), 0755, true) && !is_dir(dirname($abs))) {
            throw new RuntimeException('The uploads folder is not writable on the server.');
        }
        imagesavealpha($img, true);
        $ok = match ($ext) {
            'jpg'  => imagejpeg($img, $abs, 85),
            'png'  => imagepng($img, $abs, 6),
            'webp' => imagewebp($img, $abs, 85),
        };
        imagedestroy($img);
        if (!$ok) {
            throw new RuntimeException('The image could not be saved on the server.');
        }
        @chmod($abs, 0644);

        Database::run(
            'INSERT INTO media (path, original_name, mime, size_bytes, width, height, alt_en, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [$rel, mb_substr($name, 0, 255), $ext === 'jpg' ? 'image/jpeg' : 'image/' . $ext, (int) filesize($abs), $w, $h, $alt !== '' ? mb_substr($alt, 0, 255) : null, $userId]
        );
        return ['id' => (int) Database::pdo()->lastInsertId(), 'path' => $rel];
    }

    /** Is this a value an image field may hold? A file in uploads/ or assets/, or an https:// address. */
    public static function validPath(string $path): bool
    {
        if ($path === '') {
            return true;
        }
        if (preg_match('#^(uploads|assets)/[A-Za-z0-9/_.-]+\.(jpe?g|png|webp|svg)$#i', $path) && !str_contains($path, '..')) {
            return true;
        }
        return (bool) preg_match('#^https://[A-Za-z0-9.-]+/[^\s"\'<>]*$#', $path);
    }
}
