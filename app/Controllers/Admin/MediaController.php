<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Core\Session;
use App\Core\Upload;
use RuntimeException;

/** Uploaded images: upload, describe (alt text), delete when nothing uses them. */
final class MediaController extends BaseController
{
    public static function index(): void
    {
        if (!$u = self::requireUser()) {
            return;
        }
        $rows = Database::all('SELECT m.*, a.name AS uploader FROM media m LEFT JOIN admin_users a ON a.id = m.uploaded_by ORDER BY m.id DESC');
        foreach ($rows as &$r) {
            $r['used_in'] = self::usedIn($r['path']);
        }
        self::render('media', ['title' => 'Media', 'user' => $u, 'rows' => $rows, 'isAdmin' => $u['role'] === 'admin']);
    }

    public static function upload(): void
    {
        if (!$u = self::requireUser()) {
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        try {
            $saved = Upload::image($_FILES['file'] ?? [], (int) $u['id'], self::input('alt'));
            Session::flash('success', 'Uploaded as ' . $saved['path'] . '. Paste that path into an image field, or upload directly from the item’s form.');
        } catch (RuntimeException $e) {
            Session::flash('error', 'Not uploaded: ' . $e->getMessage());
        }
        self::redirect('/media');
    }

    public static function describe(string $id): void
    {
        if (!$u = self::requireUser()) {
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        $alt = mb_substr(self::input('alt'), 0, 255);
        Database::run('UPDATE media SET alt_en = ? WHERE id = ?', [$alt === '' ? null : $alt, (int) $id]);
        Session::flash('success', 'Description saved.');
        self::redirect('/media');
    }

    public static function deleteForm(string $id): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        $m = self::find($id);
        if (!$m) {
            self::render('error', ['title' => 'Not found', 'user' => $u, 'status' => 404, 'heading' => 'Image not found', 'message' => 'It may have been deleted already.'], 404);
            return;
        }
        self::render('media-delete', ['title' => 'Delete image', 'user' => $u, 'm' => $m, 'usedIn' => self::usedIn($m['path'])]);
    }

    public static function delete(string $id): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        $m = self::find($id);
        if ($m && !self::usedIn($m['path'])) {
            $file = PUBLIC_DIR . '/' . $m['path'];
            // only ever delete inside uploads/
            if (str_starts_with($m['path'], 'uploads/') && !str_contains($m['path'], '..') && is_file($file)) {
                unlink($file);
            }
            Database::run('DELETE FROM media WHERE id = ?', [(int) $m['id']]);
            Session::flash('success', 'Image deleted.');
        } elseif ($m) {
            Session::flash('error', 'Not deleted: the image is still used on the website.');
        }
        self::redirect('/media');
    }

    private static function find(string $id): ?array
    {
        if (!ctype_digit($id)) {
            return null;
        }
        $rows = Database::all('SELECT * FROM media WHERE id = ?', [(int) $id]);
        return $rows[0] ?? null;
    }

    /** Where an image path is used, e.g. ["Leadership: MD Ibna Faysal"]. */
    private static function usedIn(string $path): array
    {
        $out = [];
        foreach (Database::all('SELECT name FROM team WHERE photo = ?', [$path]) as $r) {
            $out[] = 'Leadership: ' . $r['name'];
        }
        foreach (Database::all('SELECT name FROM destinations WHERE photo_src = ?', [$path]) as $r) {
            $out[] = 'Destinations: ' . $r['name'];
        }
        return $out;
    }
}
