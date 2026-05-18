-- Migration 0003: grouped skills rows.
--
-- This migration evolves the legacy contact-skill buckets into the grouped
-- Skills shape used by the public portfolio direction.
--
-- Live-data note: run `npm run backup:supabase` before applying this to a live
-- Supabase project. Existing `name`/`level` values are backfilled into imported
-- grouped rows before the legacy columns are removed. Imported rows are left
-- unpublished so the public Skills section can keep using static fallbacks until
-- grouped rows are curated and published through admin.

ALTER TABLE skills ADD COLUMN IF NOT EXISTS group_label TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS group_sort_order INTEGER;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS item_sort_order INTEGER;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS published BOOLEAN;

WITH ordered_legacy_skills AS (
    SELECT
        id,
        COALESCE(NULLIF(btrim(name), ''), '') AS legacy_label,
        CASE level
            WHEN 'proficient' THEN 'Imported Proficient'
            WHEN 'experiencing' THEN 'Imported Experiencing'
            ELSE 'Imported Skills'
        END AS imported_group_label,
        CASE level
            WHEN 'proficient' THEN 0
            WHEN 'experiencing' THEN 1
            ELSE 2
        END AS imported_group_sort_order,
        ROW_NUMBER() OVER (
            PARTITION BY level
            ORDER BY id
        ) - 1 AS imported_item_sort_order
    FROM skills
)
UPDATE skills
SET
    group_label = COALESCE(NULLIF(btrim(skills.group_label), ''), ordered_legacy_skills.imported_group_label),
    label = COALESCE(NULLIF(btrim(skills.label), ''), ordered_legacy_skills.legacy_label),
    group_sort_order = COALESCE(skills.group_sort_order, ordered_legacy_skills.imported_group_sort_order),
    item_sort_order = COALESCE(skills.item_sort_order, ordered_legacy_skills.imported_item_sort_order),
    published = COALESCE(skills.published, FALSE)
FROM ordered_legacy_skills
WHERE skills.id = ordered_legacy_skills.id;

UPDATE skills
SET
    group_label = COALESCE(NULLIF(btrim(group_label), ''), 'Imported Skills'),
    label = COALESCE(NULLIF(btrim(label), ''), ''),
    group_sort_order = COALESCE(group_sort_order, 0),
    item_sort_order = COALESCE(item_sort_order, 0),
    published = COALESCE(published, FALSE);

ALTER TABLE skills ALTER COLUMN group_label SET DEFAULT '';
ALTER TABLE skills ALTER COLUMN group_label SET NOT NULL;
ALTER TABLE skills ALTER COLUMN label SET DEFAULT '';
ALTER TABLE skills ALTER COLUMN label SET NOT NULL;
ALTER TABLE skills ALTER COLUMN group_sort_order SET DEFAULT 0;
ALTER TABLE skills ALTER COLUMN group_sort_order SET NOT NULL;
ALTER TABLE skills ALTER COLUMN item_sort_order SET DEFAULT 0;
ALTER TABLE skills ALTER COLUMN item_sort_order SET NOT NULL;
ALTER TABLE skills ALTER COLUMN published SET DEFAULT TRUE;
ALTER TABLE skills ALTER COLUMN published SET NOT NULL;

ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_level_check;
ALTER TABLE skills DROP COLUMN IF EXISTS name;
ALTER TABLE skills DROP COLUMN IF EXISTS level;

COMMENT ON TABLE skills IS
    'Grouped Skills rows used by the public portfolio and local admin backend.';
COMMENT ON COLUMN skills.group_label IS
    'Display group for a skill item, such as Core Web Stack or Backend.';
COMMENT ON COLUMN skills.label IS
    'Skill item text shown inside its group.';
COMMENT ON COLUMN skills.group_sort_order IS
    'Stable ordering for skill groups.';
COMMENT ON COLUMN skills.item_sort_order IS
    'Stable ordering for skill items within a group.';
COMMENT ON COLUMN skills.published IS
    'Whether the grouped skill row is available to public Skills reads.';

CREATE INDEX IF NOT EXISTS skills_public_grouped_order_idx
    ON skills (published, group_sort_order, group_label, item_sort_order, label, id);
