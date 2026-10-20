<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Auth;
use App\Core\Csrf;
use App\Core\Response;
use App\Core\Session;

/** Shared helpers for every admin page. */
abstract class BaseController
{
    /** Admin panel sections. admin = only the Admin role; phase = when editing arrives (null = built). */
    public const SECTIONS = [
        'destinations'     => ['label' => 'Destinations',  'admin' => false, 'phase' => null, 'note' => 'Countries, intro text, requirements and photos'],
        'programs'         => ['label' => 'Programs',      'admin' => false, 'phase' => null, 'note' => 'Program detail pages, fees and scholarships'],
        'universities'     => ['label' => 'Universities',  'admin' => false, 'phase' => null, 'note' => 'University cards'],
        'intakes'          => ['label' => 'Intakes',       'admin' => false, 'phase' => null, 'note' => 'Application windows and dates'],
        'scholarships'     => ['label' => 'Scholarships',  'admin' => false, 'phase' => null, 'note' => 'University scholarship offers'],
        'gov-scholarships' => ['label' => 'Gov. scholarships', 'admin' => false, 'phase' => null, 'note' => 'Government scholarships (Fulbright, Chevening …)'],
        'team'             => ['label' => 'Leadership',    'admin' => false, 'phase' => null, 'note' => 'Leader profiles and photos'],
        'news'             => ['label' => 'News',          'admin' => false, 'phase' => null, 'note' => 'Posts, drafts and publishing'],
        'testimonials'     => ['label' => 'Testimonials',  'admin' => false, 'phase' => null, 'note' => 'Student stories with written consent'],
        'offices'          => ['label' => 'Offices',       'admin' => true,  'phase' => null, 'note' => 'Office addresses'],
        'policies'         => ['label' => 'Policies',      'admin' => true,  'phase' => null, 'note' => 'Privacy, terms and disclaimer'],
        'media'            => ['label' => 'Media',         'admin' => false, 'phase' => null, 'note' => 'Uploaded images'],
        'leads'            => ['label' => 'Leads',         'admin' => false, 'phase' => null, 'note' => 'Enquiries from the website forms'],
        'settings'         => ['label' => 'Settings',      'admin' => true,  'phase' => null, 'note' => 'Phone, WhatsApp, social links, promo bar, rates'],
        'users'            => ['label' => 'Users',         'admin' => true,  'phase' => null, 'note' => 'Who can sign in, and their role'],
    ];

    /** Headers for every admin response: never cached, never framed, never indexed, strict CSP. */
    protected static function adminHeaders(): void
    {
        header('Cache-Control: no-store, max-age=0');
        header('Pragma: no-cache');
        header('X-Frame-Options: DENY');
        header('X-Robots-Tag: noindex, nofollow');
        header('Referrer-Policy: no-referrer');
        header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; "
             . "font-src https://fonts.gstatic.com; img-src 'self' data: https://upload.wikimedia.org; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'");
    }

    /** Signed-in user or a redirect to the sign-in page. */
    protected static function requireUser(): ?array
    {
        Session::start();
        self::adminHeaders();
        $u = Auth::user();
        if ($u === null) {
            $path = (string) parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
                Session::set('after_login', $path);
            }
            Response::redirect(base_path() . '/admin/login', 303);
            return null;
        }
        return $u;
    }

    /** Signed-in Admin, or a 403 page for an Editor. */
    protected static function requireAdmin(): ?array
    {
        $u = self::requireUser();
        if ($u !== null && $u['role'] !== 'admin') {
            self::forbidden($u);
            return null;
        }
        return $u;
    }

    protected static function forbidden(array $user): void
    {
        self::render('error', [
            'title' => 'No permission', 'user' => $user, 'status' => 403,
            'heading' => 'You do not have permission for this page',
            'message' => 'This part of the admin panel is for the Admin role only. Ask an Admin if you need a change here.',
        ], 403);
    }

    /** Stops a POST without a valid CSRF token. Returns true if the request may continue. */
    protected static function checkCsrf(?array $user = null): bool
    {
        if (Csrf::valid()) {
            return true;
        }
        // a POST bigger than the server's post_max_size arrives empty: say so instead of "expired"
        if (!$_POST && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
            self::render('error', [
                'title' => 'Too large', 'user' => $user, 'status' => 413,
                'heading' => 'The upload is too large',
                'message' => 'Nothing was saved. Images can be up to 5 MB. Go back and choose a smaller file.',
            ], 413);
            return false;
        }
        self::render('error', [
            'title' => 'Form expired', 'user' => $user, 'status' => 419,
            'heading' => 'This form has expired',
            'message' => 'Nothing was saved. Go back, reload the page and try again.',
        ], 419);
        return false;
    }

    /** Renders app/Views/admin/<template>.php inside the admin layout. */
    protected static function render(string $template, array $vars = [], int $status = 200): void
    {
        self::adminHeaders();
        $vars += ['user' => Auth::user(), 'title' => 'Admin', 'flash' => Session::takeFlash()];
        $vars['sections'] = self::SECTIONS;
        $html = (static function (string $__file, array $__vars): string {
            extract($__vars, EXTR_SKIP);
            ob_start();
            require $__file;
            $content = ob_get_clean();
            ob_start();
            require APP_DIR . '/Views/admin/layout.php';
            return (string) ob_get_clean();
        })(APP_DIR . '/Views/admin/' . $template . '.php', $vars);
        http_response_code($status);
        header('Content-Type: text/html; charset=utf-8');
        echo $html;
    }

    protected static function redirect(string $adminPath): void
    {
        Response::redirect(base_path() . '/admin' . $adminPath, 303);
    }

    protected static function input(string $key): string
    {
        $v = $_POST[$key] ?? '';
        return is_string($v) ? trim($v) : '';
    }
}
