<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Auth;
use App\Core\Mailer;
use App\Core\Session;
use App\Models\AdminUser;

/** Sign in, sign out, forgot password and reset password. */
final class AuthController extends BaseController
{
    public static function loginForm(): void
    {
        Session::start();
        if (Auth::user()) {
            self::redirect('');
            return;
        }
        self::render('login', ['title' => 'Sign in', 'email' => '', 'error' => null]);
    }

    public static function login(): void
    {
        Session::start();
        if (!self::checkCsrf()) {
            return;
        }
        $email = self::input('email');
        $result = Auth::attempt($email, (string) ($_POST['password'] ?? ''));

        if ($result === 'ok') {
            $to = Session::get('after_login');
            Session::forget('after_login');
            $prefix = base_path() . '/admin';
            // only ever go back to an admin page on this site
            $safe = is_string($to) && str_starts_with($to, $prefix) && !str_contains($to, '//') ? $to : $prefix;
            \App\Core\Response::redirect($safe, 303);
            return;
        }
        $error = $result === 'locked'
            ? 'Too many failed attempts. Sign-in is locked for ' . Auth::LOCK_MINUTES . ' minutes.'
            : 'The email or password is wrong.';
        self::render('login', ['title' => 'Sign in', 'email' => $email, 'error' => $error], $result === 'locked' ? 429 : 200);
    }

    public static function logout(): void
    {
        Session::start();
        if (!self::checkCsrf(Auth::user())) {
            return;
        }
        Auth::logout();
        Session::start();
        Session::flash('success', 'You are signed out.');
        self::redirect('/login');
    }

    public static function forgotForm(): void
    {
        Session::start();
        self::render('forgot', ['title' => 'Forgot password', 'sent' => false]);
    }

    public static function forgot(): void
    {
        Session::start();
        if (!self::checkCsrf()) {
            return;
        }
        $email = AdminUser::normaliseEmail(self::input('email'));
        // the same answer whether or not the account exists (and when rate-limited)
        if (!Auth::tooMany('forgot', 5, 15) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $u = AdminUser::findByEmail($email);
            if ($u && $u['is_active']) {
                $token = Auth::createResetToken((int) $u['id']);
                Mailer::send($u['email'], 'Reset your EduRise admin password', self::resetEmail($u['name'], url('admin/reset?token=' . $token), false));
            }
        }
        self::render('forgot', ['title' => 'Forgot password', 'sent' => true]);
    }

    public static function resetForm(): void
    {
        Session::start();
        $token = (string) ($_GET['token'] ?? '');
        $row = Auth::findResetToken($token);
        self::render('reset', ['title' => 'Set a new password', 'token' => $row ? $token : null, 'errors' => []], $row ? 200 : 410);
    }

    public static function reset(): void
    {
        Session::start();
        if (!self::checkCsrf()) {
            return;
        }
        $token = self::input('token');
        $row = Auth::findResetToken($token);
        if (!$row) {
            self::render('reset', ['title' => 'Set a new password', 'token' => null, 'errors' => []], 410);
            return;
        }
        $password = (string) ($_POST['password'] ?? '');
        $errors = AdminUser::passwordProblems($password, (string) ($_POST['password_confirm'] ?? ''), $row['email']);
        if ($errors) {
            self::render('reset', ['title' => 'Set a new password', 'token' => $token, 'errors' => $errors], 422);
            return;
        }
        Auth::useResetToken((int) $row['id']);
        AdminUser::setPassword((int) $row['admin_user_id'], $password);
        \App\Core\Database::run('DELETE FROM login_attempts WHERE email = ? AND success = 0', [$row['email']]);
        Session::flash('success', 'Your password is set. Sign in with it now.');
        self::redirect('/login');
    }

    /** Plain-text email for a reset or an invitation link. */
    public static function resetEmail(string $name, string $link, bool $invite): string
    {
        $hours = $invite ? Auth::INVITE_HOURS . ' hours' : '1 hour';
        $first = $invite
            ? "An EduRise Global admin account has been created for you. Set your password with this link:"
            : "Someone asked to reset the password of your EduRise Global admin account. If it was you, set a new password with this link:";
        return "Hello $name,\n\n$first\n\n$link\n\nThe link works once and expires in $hours.\n"
             . ($invite ? '' : "If you did not ask for this, ignore this email; your password stays the same.\n")
             . "\nEduRise Global\n";
    }
}
