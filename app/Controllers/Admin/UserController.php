<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Auth;
use App\Core\Mailer;
use App\Core\Session;
use App\Models\AdminUser;

/**
 * Admin-only: add people, change roles, turn accounts off, send set-password
 * links. Accounts are never deleted, only turned off (keeps the history of who
 * changed what).
 */
final class UserController extends BaseController
{
    public static function index(): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        self::render('users', ['title' => 'Users', 'user' => $u, 'users' => AdminUser::all(), 'link' => Session::get('invite_link')]);
        Session::forget('invite_link');
    }

    public static function createForm(): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        self::render('user-form', ['title' => 'Add a user', 'user' => $u, 'edit' => null, 'form' => ['name' => '', 'username' => '', 'email' => '', 'role' => 'editor', 'is_active' => 1], 'errors' => []]);
    }

    public static function store(): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        $form = ['name' => self::input('name'), 'username' => AdminUser::normaliseUsername(self::input('username')), 'email' => AdminUser::normaliseEmail(self::input('email')), 'role' => self::input('role'), 'is_active' => 1];
        $errors = self::validate($form);
        if (!$errors && AdminUser::findByEmail($form['email'])) {
            $errors[] = 'An account with that email already exists.';
        }
        if (!$errors && AdminUser::findByUsername($form['username'])) {
            $errors[] = 'That username is taken. Choose another.';
        }
        if ($errors) {
            self::render('user-form', ['title' => 'Add a user', 'user' => $u, 'edit' => null, 'form' => $form, 'errors' => $errors], 422);
            return;
        }
        $id = AdminUser::create($form['name'], $form['email'], $form['role'], null, $form['username']);
        self::sendLink($id, true);
        Session::flash('success', "{$form['name']} was added as " . AdminUser::ROLES[$form['role']] . '. A link to set their password was emailed to them.');
        self::redirect('/users');
    }

    public static function editForm(string $id): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        $edit = AdminUser::find((int) $id);
        if (!$edit) {
            self::render('error', ['title' => 'Not found', 'user' => $u, 'status' => 404, 'heading' => 'User not found', 'message' => 'This account does not exist.'], 404);
            return;
        }
        self::render('user-form', ['title' => 'Edit user', 'user' => $u, 'edit' => $edit, 'form' => $edit, 'errors' => []]);
    }

    public static function update(string $id): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        $edit = AdminUser::find((int) $id);
        if (!$edit) {
            self::redirect('/users');
            return;
        }
        $form = ['name' => self::input('name'), 'username' => AdminUser::normaliseUsername(self::input('username')), 'email' => $edit['email'], 'role' => self::input('role'), 'is_active' => isset($_POST['is_active']) ? 1 : 0];
        $errors = self::validate($form, false);

        $other = $form['username'] !== '' ? AdminUser::findByUsername($form['username']) : null;
        if ($other && (int) $other['id'] !== (int) $edit['id']) {
            $errors[] = 'That username is taken. Choose another.';
        }

        $self = (int) $edit['id'] === (int) $u['id'];
        if ($self && ($form['role'] !== 'admin' || !$form['is_active'])) {
            $errors[] = 'You cannot remove your own Admin role or turn off your own account. Ask another Admin.';
        }
        $wasActiveAdmin = $edit['role'] === 'admin' && $edit['is_active'];
        $staysActiveAdmin = $form['role'] === 'admin' && $form['is_active'];
        if ($wasActiveAdmin && !$staysActiveAdmin && AdminUser::activeAdminCount() <= 1) {
            $errors[] = 'This is the last active Admin. Make someone else an Admin first.';
        }
        if ($errors) {
            self::render('user-form', ['title' => 'Edit user', 'user' => $u, 'edit' => $edit, 'form' => $form + $edit, 'errors' => $errors], 422);
            return;
        }
        AdminUser::update((int) $edit['id'], $form['name'], $form['role'], (bool) $form['is_active'], $form['username']);
        Session::flash('success', 'Saved. ' . ($form['is_active'] ? '' : "{$form['name']} can no longer sign in."));
        self::redirect('/users');
    }

    /** Sends a new set-password link (also shown once to the Admin, in case email is not working yet). */
    public static function link(string $id): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        $edit = AdminUser::find((int) $id);
        if ($edit && $edit['is_active']) {
            self::sendLink((int) $edit['id'], true);
            Session::flash('success', "A new set-password link was emailed to {$edit['email']}.");
        }
        self::redirect('/users');
    }

    private static function sendLink(int $userId, bool $invite): void
    {
        $target = AdminUser::find($userId);
        $link = url('admin/reset?token=' . Auth::createResetToken($userId, $invite));
        Mailer::send($target['email'], 'Your EduRise admin account', AuthController::resetEmail($target['name'], $link, $invite));
        Session::set('invite_link', ['email' => $target['email'], 'url' => $link]);
    }

    private static function validate(array $form, bool $checkEmail = true): array
    {
        $e = [];
        if ($form['name'] === '' || mb_strlen($form['name']) > 120) {
            $e[] = 'Enter a name (up to 120 characters).';
        }
        if (!AdminUser::validUsername($form['username'])) {
            $e[] = 'Choose a username: 3–40 characters, a–z, 0–9, dot, dash or underscore.';
        }
        if ($checkEmail && !filter_var($form['email'], FILTER_VALIDATE_EMAIL)) {
            $e[] = 'Enter a valid email address.';
        }
        if (!isset(AdminUser::ROLES[$form['role']])) {
            $e[] = 'Choose a role.';
        }
        return $e;
    }
}
