-- Migration 0004: project classification fields.
--
-- Adds optional classification fields used to select featured projects and
-- display project labels without splitting projects into separate tables.
-- Existing project rows remain valid with null classification values.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured_rank INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS labels JSONB;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'projects_project_type_check'
          AND conrelid = 'projects'::regclass
    ) THEN
        ALTER TABLE projects
            ADD CONSTRAINT projects_project_type_check
            CHECK (
                project_type IS NULL
                OR project_type IN ('school', 'internship', 'personal', 'client', 'open-source')
            )
            NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'projects_labels_array_check'
          AND conrelid = 'projects'::regclass
    ) THEN
        ALTER TABLE projects
            ADD CONSTRAINT projects_labels_array_check
            CHECK (labels IS NULL OR jsonb_typeof(labels) = 'array')
            NOT VALID;
    END IF;
END $$;

COMMENT ON COLUMN projects.featured_rank IS
    'Nullable integer for featured project ordering. Null means not featured; lower numbers sort first.';
COMMENT ON COLUMN projects.project_type IS
    'Optional primary project classification: school, internship, personal, client, or open-source.';
COMMENT ON COLUMN projects.labels IS
    'Optional JSONB string array of display labels for project cards and details.';
