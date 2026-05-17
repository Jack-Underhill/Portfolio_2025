# Styles

`src/styles` contains shared styling primitives for the portfolio frontend and admin UI.

Use this directory for reusable tokens, global utility classes, animations, and small class-name recipes that are shared across multiple components.

## Scope

- Define Tailwind theme colors and global CSS variables.
- Provide reusable shadow, overlay, scrollbar, marquee, and gradient utility classes.
- Keep repeated admin form and admin UI class strings in one place.
- Provide the `cx` helper for simple conditional class composition.

Keep this directory free of feature-specific layout decisions, component state, data fetching, and one-off styles that are easier to understand beside the component that uses them.

## Files

- `theme.css`: imported by `src/index.css`; owns theme tokens, CSS variables, global utility classes, and keyframes.
- `recipes.js`: exports shared Tailwind class recipes used primarily by admin forms, panels, buttons, links, labels, and helper text.

## Boundary Notes

- Add values to `theme.css` when they represent shared visual language or global reusable behavior.
- Add entries to `recipes.js` only when a class recipe is reused across multiple components or clarifies a repeated admin pattern.
- Prefer component-local class names for isolated layout or feature-specific styling.
- Keep public site visual tokens and admin-specific tokens clearly named so the two surfaces can evolve independently.
- Keep detailed styling cleanup notes in `docs/`. This README is only the local map for maintainers reading `src/styles`.
