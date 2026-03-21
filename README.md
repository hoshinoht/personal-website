# hoshinoht.dev

Personal portfolio website for Po Haoting — Computing Science undergraduate, ML Research Assistant, and software engineer.

**Live:** [hoshinoht.dev](https://hoshinoht.dev)

## Tech Stack

- **React 19** + **TypeScript** + **Vite 6** (Bun runtime)
- **CSS Modules** with Material 3 Expressive design tokens
- **Framer Motion** for scroll reveals and transitions
- **Lucide React** for icons
- **Catppuccin** color palette (Dusk dark / Latte light)

No Tailwind. No component library. Pure custom CSS.

## Features

### Interactive
- **Command Palette** (`Cmd+K`) — fuzzy search across projects, skills, experience
- **Terminal** (`` ` ``) — easter egg terminal with `ls`, `cat`, `whoami`, `neofetch`
- **JD Matcher** (sparkle FAB) — paste a job description, get ranked portfolio matches
- **Domain Filter** — filter content by interest area (ML & AI, Cloud, IoT, etc.)
- **Keyboard Navigation** (`J`/`K`) — jump between sections
- **Theme Toggle** — Catppuccin Dusk (dark) / Latte (light)
- **Shareable URLs** — filter state syncs to URL hash

### Design
- Material 3 Expressive shape system and typography scale
- Glassmorphism navigation rail with backdrop blur
- Animated mesh gradient hero background
- Domain-colored accent borders on project cards
- Color-coded tech chips (languages / frameworks / infrastructure / protocols)
- Scroll progress gradient bar
- Collapsible experience and project cards

### Data
- Content auto-synced from resume YAML index via `bun run sync`
- GitHub live status badge showing latest push activity
- Impact stats strip (700+ commits, 2M+ LOC, etc.)

## Development

```bash
bun install
bun run dev
```

## Sync Content from Resume Index

```bash
bun run sync
# Or with custom path:
RESUME_INDEX_PATH=/path/to/yaml bun run sync
```

## Build

```bash
bun run build
```

## Deployment

Deployed to GitHub Pages via GitHub Actions.

## License

[CC BY-NC-ND 4.0](./LICENSE) — you may view and share with attribution, but not modify or use commercially.


---

```
[YoRHa] System Report — hoshinoht.dev
──────────────────────────────────────
  Status ........... All services nominal
  Memory ........... Stable
  Black Box ........ Sealed
  Override ......... [ 38 38 40 40 37 39 37 39 66 65 ]

  Glory to mankind.
```