<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules (planIT)

- Stack: Next.js App Router + TypeScript + Tailwind CSS v4
- Folder structure:
  - Routes in `src/app/` — `(public)` for Guest pages, `(student)` for pages that need login
  - Feature code in `src/features/<feature>/` (courses, tracks, planner, reviews), each with `components/`, `hooks/`, `api.ts`
  - Shared UI only in `src/components/ui/`, layout parts in `src/components/layout/`
  - Shared types in `src/types/`, mock data in `src/mocks/`
- Styling:
  - Use design tokens from `globals.css` only, never hardcode colors or font sizes
  - Colors: `bg`, `surface`, `hover`, `border`, `border-strong`, `fg`, `fg-muted`, `accent` (blue, primary), `signature` (orange, logo/stars/small highlights only), `success`, `warning`, `error`
  - Text styles: `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-label`, `text-caption`
  - Radius: `rounded-sm` (badge), `rounded-md` (button, input), `rounded-lg` (card)
  - Cards use a 1px `border`, not shadows; `shadow-pop` only for dropdown/modal/toast
- Components are Server Components by default; add `"use client"` only when using state, effects, or event handlers
- UI text is in Thai; course codes, credits and track names stay in English
- Icons: lucide-react only
