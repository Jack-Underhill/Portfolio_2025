# Case Study Draft Guidelines

Use this guide before drafting, reviewing, or revising project card copy and project detail modal content.

The portfolio has a mixed audience: family and friends who need plain-language clarity, plus HR, employers, and developers who need fast evidence of skill, judgment, and ownership. Optimize every field for scan value. Do not fill a section just because more true details exist.

## Quality Standard

Each item should earn its space. A reviewer may only skim one section or land on one bullet, so weak filler can damage the whole case study.

Prefer:

- Concrete shipped behavior, measurable outcome, architectural responsibility, or a real constraint.
- Plain-language overview and role copy with technical detail saved for later sections.
- Fewer strong bullets over a complete implementation inventory.
- Distinct signals across sections instead of repeating the same point as a feature, metric, and challenge.

Avoid:

- Padding sections to a fixed count when the source material only supports fewer strong items.
- Library, file count, endpoint count, version, or setup details that do not add audience value.
- Challenges that restate features negatively.
- Improvements that read like a backlog dump.
- Tech stack pills that are really implementation notes.

## Field Limits

These are content-generation rules, not database validation rules.

| Field | Normal target | Hard modal cap | Outlier allowance |
| --- | ---: | ---: | --- |
| `description` | 1 sentence, 18-30 words | 1 sentence | No outlier. This is card copy, not a mini case study. |
| `overview` | 70-110 words | 130 words | Up to 150 only for domain-heavy projects where plain-language setup is needed. |
| `role` | 60-110 words | 130 words | Up to 150 when ownership spans several distinct surfaces and that ownership story matters. |
| `features` | 4-5 bullets | 6 bullets | 7 only for a major multi-surface project if every bullet is a distinct shipped capability. |
| `metrics` | 3-5 bullets | 6 bullets | 7 only for data/ML, research, production impact, or competition results with genuinely different evidence types. |
| `challenges` | 3 cards | 4 cards | 5 only for outlier projects with separate engineering problems across distinct subsystems. |
| `improvements` | 3-4 bullets | 5 bullets | 6 only for a roadmap-style project where each item is a separate credible next milestone. |
| `techStack` | 5-10 total pills | 12 total pills | 14 only for large full-stack/platform work. Avoid filler when fewer strong items exist. |

## Outlier Rules

Allow extra bullets or cards only when all of these are true:

- The item adds a new signal HR, employers, or developers would value.
- The item is not a more specific version of another item.
- The item is tied to shipped behavior, measurable outcome, architectural responsibility, or a real constraint.
- The item can stand alone if someone scans only that bullet.
- The section still fits the modal without turning into a scroll-heavy inventory.

Treat content as bloated when it mainly adds:

- A version number that does not matter to compatibility or deployment.
- A file count, route count, or library count that does not prove meaningful scale.
- A setup/tooling detail already implied by stronger content.
- A feature repeated as a metric.
- A future improvement that is lower priority than the bullets already listed.

## Field Guidance

### Description

Use `description` for the public project card. Make it one concise sentence that names the project type and strongest practical outcome.

Do not use card copy for implementation detail, class context, or a full problem statement.

### Overview

Use `overview` for the first modal paragraph: what the project is, who it serves, and why it matters.

Keep it plain enough for non-technical readers. Name the domain and outcome before naming implementation details.

### Role

Use `role` for the second modal paragraph: role/title, ownership, and main technical direction.

Do not list every task owned. Group related responsibilities into a few strong themes.

### Features

Use `features` for the best shipped capabilities.

Good feature bullets answer one of these:

- What can the user do?
- What system behavior shipped?
- What migration, integration, or workflow became possible?
- What constraint was preserved while shipping it?

Merge related UI details into one capability. Keep implementation detail only when it proves technical depth.

### Metrics

Use `metrics` for evidence: quantified outcomes, adoption, competition results, coverage, reliability, performance, scope, or concrete delivery constraints.

Put the strongest audience-facing metric first. For data/ML projects, include enough model evidence to show judgment, but do not list every split/statistic if the conclusion is already clear.

Do not use "built with X" as a metric when X already appears in the tech stack.

### Challenges

Challenges render as collapsed case-study cards, so they are visually heavier than bullets.

Use 3 by default, 4 for complex multi-system projects, and 5 only for exceptional projects with distinct, high-impact problems. Do not output 6 or more challenges for modal case studies unless the user explicitly requests a long-form version.

Each challenge should have:

- `challenge`: concise problem headline that can stand alone in the collapsed card.
- `solution`: what was done, written as an implementation summary for the expanded card.
- `result`: outcome, risk reduction, maintainability gain, or user impact.

A 5th challenge must represent a different class of problem, such as algorithmic complexity, data leakage, deployment constraints, state synchronization, accessibility, or security. If it is lower-signal than an existing challenge, cut it.

### Improvements

Use `improvements` for credible future engineering follow-ups, not apologies.

Prefer the next highest-leverage engineering moves. Cut speculative, repetitive, or low-priority nice-to-haves.

### Tech Stack

Keep `techStack` values as recognizable tools, platforms, languages, and essential domain concepts.

Prefer examples like `React`, `Vite`, `FastAPI`, `Supabase`, `Netlify`, `Weighted graph`, or `Java 21` when compatibility matters.

Avoid:

- Versions unless compatibility or deployment makes them meaningful.
- Generic workflow tools such as `npm`, `setuptools`, `Visual Studio`, or `ESLint`.
- Internal file structures or implementation objects.
- Domain concepts when the project already has enough stronger real stack items.
- Repeating the same concept across categories.

A small project with 4 strong tech pills is better than one padded to 12.

## Existing Project Review Mode

Ask for or use current project draft context before revising an existing case study. Prefer the admin `Copy current context` action. A manual copy/export is acceptable only if the UI is unavailable.

Review current project context shaped like this. Treat `projectContext` as read-only identification and `draft` as supported content fields to compare, not as an import payload:

```json
{
  "projectContext": {
    "id": "project-id-for-reference-only",
    "title": "Current project title",
    "permalink": "current-project-permalink",
    "projectType": "personal",
    "labels": ["Existing label"]
  },
  "draft": {
    "title": "Current project title",
    "description": "Current card summary",
    "overview": "Current modal overview",
    "role": "Current role summary",
    "features": ["Current feature"],
    "metrics": ["Current metric"],
    "challenges": [
      {
        "challenge": "Current challenge",
        "solution": "Current solution",
        "result": "Current result"
      }
    ],
    "improvements": ["Current improvement"],
    "techStack": {
      "frontend": ["React"],
      "backend": ["Node"],
      "data": ["Supabase"],
      "infrastructure": ["Netlify"]
    },
    "projectType": "personal",
    "labels": ["Existing label"],
    "url": "https://example.com",
    "sourceUrl": "https://github.com/example/repo",
    "writeupUrl": "",
    "videoPageUrl": "",
    "published": true,
    "featuredRank": ""
  }
}
```

Compare the current draft against new source material before producing import JSON. Name accurate existing content, stale content, missing content, contradictions, assumptions, and preserved fields outside the JSON.

Output either a full refreshed payload or a minimal patch payload using supported import fields. Missing supported keys preserve the active admin draft. Present empty strings or arrays intentionally clear those fields.

## Review Checklist

Before returning draft JSON or review recommendations, check:

- Does each section stay within the normal target unless it clearly meets the outlier rules?
- Can every bullet stand alone for a fast scanner?
- Are simple fields plain enough for non-technical readers?
- Are technical sections specific enough for developers?
- Are any features, metrics, challenges, or improvements redundant?
- Are tech stack pills short, recognizable, and useful?
- Are optional URLs empty strings when no public link exists?
- Is the fenced JSON limited to supported import fields?
