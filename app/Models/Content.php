<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/**
 * Reads and writes the rows of a content section (see Sections). Table and
 * column names only ever come from the section definitions, never from the
 * request; all values are bound parameters.
 */
final class Content
{
    /** All rows of a section for the admin list, hidden ones included. */
    public static function list(array $section): array
    {
        $t = $section['table'];
        $order = $section['order'] ?? 'sort_order, id';
        $join = isset($section['fields']['destination_id']) ? ', (SELECT name FROM destinations d WHERE d.id = c.destination_id) AS destination_name' : '';
        return Database::all("SELECT c.*$join FROM $t c ORDER BY $order");
    }

    public static function find(array $section, int $id): ?array
    {
        $rows = Database::all("SELECT * FROM {$section['table']} WHERE id = ?", [$id]);
        return $rows[0] ?? null;
    }

    /** id => name of every destination, for the Country menus. */
    public static function destinations(): array
    {
        $out = [];
        foreach (Database::all('SELECT id, name, is_visible FROM destinations ORDER BY sort_order, id') as $r) {
            $out[(int) $r['id']] = $r['name'] . ($r['is_visible'] ? '' : ' (hidden)');
        }
        return $out;
    }

    public static function slugTaken(array $section, string $slug, ?int $exceptId = null): bool
    {
        return (int) Database::value(
            "SELECT COUNT(*) FROM {$section['table']} WHERE slug = ? AND id <> ?",
            [$slug, $exceptId ?? 0]
        ) > 0;
    }

    /** Insert (id null) or update a row. $values: column => value, columns from the section only. */
    public static function save(array $section, ?int $id, array $values): int
    {
        $allowed = array_merge(array_keys($section['fields']), ['bn', 'is_visible', 'sort_order']);
        $values = array_intersect_key($values, array_flip($allowed));
        $t = $section['table'];
        if ($id === null) {
            $values['sort_order'] = (int) Database::value("SELECT COALESCE(MAX(sort_order), 0) + 10 FROM $t");
            $cols = array_keys($values);
            Database::run(
                sprintf('INSERT INTO %s (%s) VALUES (%s)', $t, implode(', ', $cols), implode(', ', array_fill(0, count($cols), '?'))),
                array_values($values)
            );
            return (int) Database::pdo()->lastInsertId();
        }
        if ($values) {
            $set = implode(', ', array_map(static fn ($c) => "$c = ?", array_keys($values)));
            Database::run("UPDATE $t SET $set WHERE id = ?", [...array_values($values), $id]);
        }
        return $id;
    }

    public static function setVisible(array $section, int $id, bool $visible): void
    {
        Database::run("UPDATE {$section['table']} SET is_visible = ? WHERE id = ?", [$visible ? 1 : 0, $id]);
    }

    /** Swap a row with its neighbour above (-1) or below (+1) in the list order. */
    public static function move(array $section, int $id, int $step): void
    {
        $t = $section['table'];
        $pdo = Database::pdo();
        $pdo->beginTransaction();
        try {
            $ids = array_map('intval', array_column(Database::all("SELECT id FROM $t ORDER BY sort_order, id FOR UPDATE"), 'id'));
            $i = array_search($id, $ids, true);
            $j = $i === false ? false : $i + $step;
            if ($i !== false && $j >= 0 && $j < count($ids)) {
                [$ids[$i], $ids[$j]] = [$ids[$j], $ids[$i]];
                $stmt = $pdo->prepare("UPDATE $t SET sort_order = ? WHERE id = ?");
                foreach ($ids as $pos => $rowId) {
                    $stmt->execute([($pos + 1) * 10, $rowId]);
                }
            }
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    /**
     * What still uses this row (and would be deleted with it), e.g. a country's programs.
     * @return array<string,int> label => count
     */
    public static function dependants(array $section, int $id): array
    {
        if ($section['table'] !== 'destinations') {
            return [];
        }
        $out = [];
        foreach (['programs' => 'programs', 'universities' => 'universities', 'intakes' => 'intakes', 'scholarships' => 'scholarship offers'] as $t => $label) {
            $n = (int) Database::value("SELECT COUNT(*) FROM $t WHERE destination_id = ?", [$id]);
            if ($n) {
                $out[$label] = $n;
            }
        }
        return $out;
    }

    public static function delete(array $section, int $id): void
    {
        Database::run("DELETE FROM {$section['table']} WHERE id = ?", [$id]);
    }
}
