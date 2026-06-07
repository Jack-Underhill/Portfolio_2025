-- Migration 0007: contact link published state.
--
-- Contact/social links remain editable in local admin when unpublished, but
-- public browser reads should only expose rows intentionally marked published.

ALTER TABLE links ADD COLUMN IF NOT EXISTS published BOOLEAN;

UPDATE links
SET published = TRUE
WHERE published IS NULL;

ALTER TABLE links ALTER COLUMN published SET DEFAULT TRUE;
ALTER TABLE links ALTER COLUMN published SET NOT NULL;

COMMENT ON COLUMN links.published IS
    'Whether the contact/social link row is available to public Contact reads.';

CREATE INDEX IF NOT EXISTS links_public_order_idx
    ON links (published, id);

GRANT SELECT ON links TO anon;

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read links" ON links;
DROP POLICY IF EXISTS "Public can read published links" ON links;
DROP POLICY IF EXISTS "Enable read access for all users" ON links;

CREATE POLICY "Public can read published links"
    ON links
    FOR SELECT
    TO anon
    USING (published IS TRUE);
