-- Migration 0006: add competition as a project type.
--
-- Keeps the primary project classification model explicit while allowing
-- hackathons, game jams, and similar limited-time competitive work.

ALTER TABLE projects
    DROP CONSTRAINT IF EXISTS projects_project_type_check;

ALTER TABLE projects
    ADD CONSTRAINT projects_project_type_check
    CHECK (
        project_type IS NULL
        OR project_type IN ('school', 'internship', 'competition', 'personal', 'client', 'open-source')
    )
    NOT VALID;

ALTER TABLE projects VALIDATE CONSTRAINT projects_project_type_check;

COMMENT ON COLUMN projects.project_type IS
    'Optional primary project classification: school, internship, competition, personal, client, or open-source.';
