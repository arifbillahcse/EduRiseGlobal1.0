<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Response;
use App\Core\Session;
use App\Models\AdminUser;

/** Dashboard, the user's own account, and the sections that arrive in Phase 3. */
final class PanelController extends BaseController
{
    public static function dashboard(): void
    {
        if (!$u = self::requireUser()) {
            return;
        }
        self::render('dashboard', ['title' => 'Dashboard', 'user' => $u]);
    }

    public static function section(string $section): void
    {
        if (!isset(self::SECTIONS[$section])) {
            Session::start();
            self::adminHeaders();
            if (!$u = self::requireUser()) {
                return;
            }
            self::render('error', ['title' => 'Not found', 'user' => $u, 'status' => 404,
                'heading' => 'Page not found', 'message' => 'This admin page does not exist.'], 404);
            return;
        }
        $s = self::SECTIONS[$section];
        $u = $s['admin'] ? self::requireAdmin() : self::requireUser();
        if (!$u) {
            return;
        }
        self::render('section', ['title' => $s['label'], 'user' => $u, 'slug' => $section, 'section' => $s]);
    }

    public static function accountForm(): void
    {
        if (!$u = self::requireUser()) {
            return;
        }
        self::render('account', ['title' => 'My account', 'user' => $u, 'errors' => []]);
    }

    public static function account(): void
    {
        if (!$u = self::requireUser()) {
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        $errors = [];
        if (!password_verify((string) ($_POST['current_password'] ?? ''), $u['password_hash'])) {
            $errors[] = 'Your current password is wrong.';
        }
        $new = (string) ($_POST['password'] ?? '');
        $errors = array_merge($errors, AdminUser::passwordProblems($new, (string) ($_POST['password_confirm'] ?? ''), $u['email']));
        if ($errors) {
            self::render('account', ['title' => 'My account', 'user' => $u, 'errors' => $errors], 422);
            return;
        }
        AdminUser::setPassword((int) $u['id'], $new);
        // stay signed in here with a new session ID; every other session is signed out
        Session::regenerate();
        Session::set('pw_stamp', (string) AdminUser::find((int) $u['id'])['password_changed_at']);
        Session::flash('success', 'Password changed. Any other device signed in with your account has been signed out.');
        self::redirect('/account');
    }

    /** The old demo dashboard address. */
    public static function legacyDemo(): void
    {
        Response::redirect(base_path() . '/admin', 301);
    }
}
