# planIT – Frontend

Frontend for **planIT**, an IT Curriculum Planner & Course Review Platform for undergraduate students of the Faculty of Information Technology (SIT), KMUTT.

Students can browse courses and tracks, plan their 4-year study path, and read/write course reviews.

> Backend repository: [Capstone-CS3-backend](https://github.com/P4warit06/Capstone-CS3-backend)

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [lucide-react](https://lucide.dev) icons
- ESLint + Prettier

## Prerequisites

- Node.js **20.9+** (LTS recommended)
- npm
- Backend API running locally (see backend repo) – or use mock data in `src/mocks`

## Getting Started

```bash
# 1. Clone
git clone https://github.com/Benyaporn54/Capstone-CS3-frontend.git
cd Capstone-CS3-frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
| --- | --- |
| `API_INTERNAL_URL` | Backend URL for server-side calls (`http://localhost:8080` locally, `http://backend:8080` in Docker) |

Auth variables will be added when login is implemented. Never commit `.env.local`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Project Structure

```
src/
├── app/                    # Routes (file-based routing)
│   ├── (public)/           # Pages Guests can access (courses, tracks)
│   ├── (student)/          # Pages that require login (planner)
│   ├── layout.tsx          # Root layout (fonts, providers)
│   └── globals.css         # Tailwind + design tokens
├── components/
│   ├── ui/                 # Reusable UI (Button, Card, Input…) from Figma
│   └── layout/             # Navbar, Footer, Providers
├── features/               # Feature modules
│   ├── courses/
│   ├── tracks/
│   ├── planner/
│   └── reviews/            # each: components/, hooks/, api.ts
├── lib/                    # api client, utils
├── types/                  # Shared types (match backend API contract)
└── mocks/                  # Mock data used until the API is ready
```

## Design Tokens

Defined in `src/app/globals.css` (from the planIT design system). Use these classes, never hardcoded colors or sizes.

- **Colors:** `bg`, `surface`, `hover`, `border`, `border-strong`, `fg`, `fg-muted`, `accent` (blue, primary), `signature` (orange, logo/stars only), `success`, `warning`, `error` – e.g. `bg-accent`, `text-fg-muted`, `border-border`
- **Text:** `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-label`, `text-caption`
- **Radius:** `rounded-sm` (badge), `rounded-md` (button, input), `rounded-lg` (card)
- **Shadow:** `shadow-pop` (dropdown, modal, toast only)
- **Fonts:** Inter (English) + IBM Plex Sans Thai (Thai)

## Conventions

**Branches** (GitHub Flow)
- `main` – always working, deployed to SIT VM
- `feature/SCRUM-<id>-short-name` – one branch per Jira task, PR into `main` (1 approval + CI pass)
- Each sprint ends with a tag, e.g. `v0.1-sprint1`

**Commits** – [Conventional Commits](https://www.conventionalcommits.org):
`feat:`, `fix:`, `chore:`, `refactor:`, `style:`, `docs:`

**Code**
- Feature-specific code goes in `src/features/<feature>/`; only truly shared UI goes in `src/components/`
- Add `"use client"` only to components that need state, effects, or event handlers
- UI text in Thai; course codes, credits and track names in English

## Deployment

Built as a Docker image (`output: "standalone"`) and served behind NGINX on the SIT VM via GitHub Actions.