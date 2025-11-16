-- =========================
-- ABOUT
-- =========================
CREATE TABLE about (
    id              SERIAL PRIMARY KEY,
    profile_image   TEXT,
    profession_title TEXT NOT NULL,
    brief_bio       TEXT,
    resume_pdf      TEXT
);

-- =========================
-- PROJECTS
-- =========================
CREATE TABLE project_section (
    id              SERIAL PRIMARY KEY,
    about_projects  TEXT
);

CREATE TABLE project_cards (
    id              SERIAL PRIMARY KEY,
    image           TEXT,
    title           TEXT NOT NULL,
    description     TEXT,
    tech            TEXT,
    url             TEXT
);

-- =========================
-- CONTACT
-- =========================

-- Skills with a simple "proficient" vs "experiencing" flag
CREATE TABLE skills (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    level           TEXT NOT NULL CHECK (level IN ('proficient', 'experiencing'))
);

-- Links (LinkedIn, GitHub, Fiverr, etc.)
CREATE TABLE links (
    id              SERIAL PRIMARY KEY,
    label           TEXT NOT NULL,
    url             TEXT NOT NULL,
    svg             TEXT
);
