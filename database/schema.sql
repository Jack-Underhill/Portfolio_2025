-- =========================
-- ABOUT
-- =========================
CREATE TABLE about (
    id              SERIAL PRIMARY KEY,   -- you’ll probably only ever use 1 row
    profile_image   TEXT,                 -- URL to image
    profession_title TEXT NOT NULL,
    brief_bio       TEXT,
    resume_pdf      TEXT                  -- URL to resume PDF
);

-- =========================
-- PROJECTS
-- =========================

-- Short text that appears above your project cards
CREATE TABLE project_section (
    id              SERIAL PRIMARY KEY,   -- again, likely 1 row
    about_projects  TEXT                  -- "about me & project short desc"
);

-- Your project cards
CREATE TABLE project_cards (
    id              SERIAL PRIMARY KEY,
    image           TEXT,                 -- URL to thumbnail/cover image
    title           TEXT NOT NULL,
    description     TEXT,
    tech            TEXT                  -- e.g. "React, Node, SQLite"
);

-- =========================
-- CONTACT
-- =========================

-- Skills with a simple "proficient" vs "experiencing" flag
CREATE TABLE skills (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,        -- e.g. "JavaScript"
    level           TEXT NOT NULL CHECK (level IN ('proficient', 'experiencing'))
);

-- Links (LinkedIn, GitHub, Fiverr, etc.)
CREATE TABLE links (
    id              SERIAL PRIMARY KEY,
    label           TEXT NOT NULL,        -- e.g. "LinkedIn"
    url             TEXT NOT NULL,        -- full URL
    kind            TEXT                  -- e.g. 'linkedin','github','fiver','upwork','handshake'
);
