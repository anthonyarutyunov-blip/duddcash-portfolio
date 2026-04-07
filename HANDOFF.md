# Session Handoff — Duddcash Portfolio Redesign

**Date:** April 6, 2026
**Status:** IN PROGRESS — redesign started, not yet complete

---

## What Happened This Session

### 1. Domain Name Discussion
- Explored domain options on Cloudflare (~$10/yr, at-cost, no markup)
- Suggested names: `duddcash.com`, `.studio`, `.film`, `.co`
- **Decision: domain purchase deferred** — user needs to buy manually at [domains.cloudflare.com](https://domains.cloudflare.com/)

### 2. Rebrand Discussion
- Discussed whether "Duddcash" is professional enough — consensus: it reads as a joke name ("dud cash")
- Brainstormed alternative names for events/nightlife/creative direction:
  - Top picks: **The Social Cut**, **Rollcall Creative**, **Off Script**
  - Full list of ~25 options across different vibes
- **Decision: name change deferred** — doing design/content overhaul first, name last

### 3. Business Context Gathered
- **Core business:** Video & photography production — events, nightlife, commercial, social content
- **Positioning:** Social directors — young, creative, reliable
- **Brand clients:** Lululemon, PrizePicks, Pringles, Mastercard, Chipotle, MoneyGram, Marine Layer, Academy Sports, Wynn, Tao Group, The Sphere, Sebastian Maniscalco, The Fall Guy, The Rock, Furiosa
- **LinkedIn bio context:** Co-founder, mentors team, focused on leading projects for top clients
- **Categories user wants:** Social, Events, Music, Photos, Spec Ads, Sports, Artsy

### 4. Redesign — Started (INCOMPLETE)

#### Completed Changes:
| File | Change |
|------|--------|
| `src/styles/global.css` | Dark palette — bg `#0b0b0b`, text `#f0f0f0`, surface `#141414`, borders `#222` |
| `src/content.config.ts` | New categories: `social`, `event`, `music`, `photo`, `spec-ad`, `sports`, `artsy`, `commercial` |
| `src/components/global/Header.astro` | Dark glass header background `rgba(11,11,11,0.92)` |
| `src/components/portfolio/FilterBar.astro` | Updated category labels to match new schema |
| `src/components/portfolio/ProjectCard.astro` | Updated category labels to match new schema |
| `src/components/home/LogoMarquee.astro` | **NEW** — Animated scrolling brand marquee with all 15 client names, fade edges, pause on hover |

#### NOT YET Done:
| Task | Details |
|------|---------|
| **Homepage rewrite** (`src/pages/index.astro`) | Needs: new hero copy, featured work section, creative photo gallery, LogoMarquee integrated at bottom |
| **About page rewrite** (`src/pages/about.astro`) | Needs: real copy from LinkedIn context, brand name drops, position nightlife as an edge not a limitation |
| **Work page update** (`src/pages/work/index.astro`) | Needs: updated subtitle copy, verify new categories render |
| **Photo gallery component** | New component for homepage — creative/vibey masonry-style layout of best photos |
| **Sample project .md files** | Current 5 projects use old categories (wedding, documentary, etc.) — need to be rewritten or replaced with new categories |
| **Contact page** | Needs review — Project Type dropdown still has old categories |
| **Footer** | May need copy update depending on final brand name |
| **Mobile nav** | Needs testing with dark theme |
| **Hero section** | New copy needed — current "We tell stories through motion & light" is too generic |
| **Brand name** | Still "DUDDCASH" everywhere — TBD on rebrand |

---

## Git State
- **Branch:** `main`
- **1 unpushed commit:** "Add Playwright test framework and update .gitignore"
- **5 modified files + 1 new file** — all unstaged, uncommitted
- **Remote:** `origin` → `https://github.com/anthonyarutyunov-blip/duddcash-portfolio`
- **Live site:** https://duddcash.netlify.app (still shows old version)

## Key Architecture Notes
- **Framework:** Astro 6.1.3 with View Transitions (ClientRouter)
- **Styling:** CSS custom properties in `src/styles/global.css` — all theming flows through these variables
- **Content:** Markdown files in `src/content/projects/` with typed Zod schema in `content.config.ts`
- **Animations:** Intersection Observer in BaseLayout + CSS in `src/styles/animations.css`
- **Forms:** Netlify Forms with honeypot protection
- **Font:** Inter variable (self-hosted in `/public/fonts/`)
- **Dev server:** `npm run dev` on port 4321, configured in `.claude/launch.json`

## Files to Focus On Next Session
```
src/pages/index.astro              ← Homepage redesign (priority #1)
src/pages/about.astro              ← About page rewrite
src/pages/contact.astro            ← Update project type dropdown
src/content/projects/*.md          ← Replace sample projects with new categories
src/components/home/LogoMarquee.astro  ← Already built, needs integration
```

## Design Direction
- **Dark, editorial, confident** — not sterile white template
- **Lead with commercial credibility** — brand logos, client work front and center
- **Homepage flow:** Hero summary → Featured Work grid → Creative photo gallery → Scrolling brand marquee
- **Categories:** Social / Events / Music / Photos / Spec Ads / Sports / Artsy / Commercial
- **NOT** a nightlife page — nightlife is part of the portfolio, not the identity
