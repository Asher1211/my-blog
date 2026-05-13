# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal learning blog with AI-powered chat and a desktop pet mascot. Public-facing blog with admin backend. The defining feature: an AI assistant that reads the current article and answers questions in context, plus semantic cross-article search.

**Design doc**: `BLOG_SYSTEM_DEV_DOC.md` — read the relevant chapter before implementing each module.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) — SSR/SSG, API Routes |
| Styling | Tailwind CSS + Framer Motion |
| Database | PostgreSQL via Neon serverless (free tier) |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| AI | DeepSeek Chat API (streaming) |
| File storage | Cloudflare R2 |
| Markdown | unified + remark + rehype + Shiki (highlighting) + KaTeX (math) |
| Deployment | Vercel Hobby Plan |

## Next.js Routing Conventions (Critical)

The design doc uses specific folder naming conventions from Next.js App Router. When creating these directories, preserve the brackets exactly:

- **`(public)` / `(admin)`** — Route groups: parentheses are part of the directory name, they group routes without affecting the URL path
- **`[slug]` / `[id]` / `[tag]` / `[category]`** — Dynamic route segments: square brackets are part of the directory name
- **`[...nextauth]`** — Catch-all segment: three dots + square brackets, required by NextAuth.js

## Architecture

```
app/
  (public)/       — Blog frontend (home, posts, tags, categories, search, timeline)
  (admin)/        — Admin backend (dashboard, post editor, media, categories, settings)
    layout.tsx    — Protected by auth (redirect to login if no session)
  api/            — API routes (posts CRUD, pet, upload, search, categories, tags)
  layout.tsx      — Root layout (global styles, fonts, desk pet mount point)

components/
  layout/         — Header, Footer, AdminSidebar
  blog/           — PostCard
  pet/            — DeskPet, PetSprite
  editor/         — MarkdownEditor, ImageUploader
  common/         — ThemeToggle, ScrollProgress, TableOfContents, CustomCursor,
                    ParticleBackground, GiscusComments, ShareButton, PageSizeSelect, GitHubStar

lib/
  db/prisma.ts    — Prisma client singleton
  ai/             — deepseek.ts (streaming), prompts.ts
  markdown/       — processor.ts (unified config), plugins.ts

prisma/schema.prisma
middleware.ts      — Route protection for /admin/*
```

## Visual Design System

**Theme**: "Late-night screening room / Digital archive" — cinematic dark cyberpunk.

- Backgrounds: near-black (`#0a0a0f`), surfaces (`#111118`), elevated (`#1a1a26`)
- Accent: cyan (`#00d4ff`) primary, amber (`#f5a623`) secondary
- Fonts: Playfair Display (headings), JetBrains Mono (code), LXGW WenKai (body)
- Global CSS noise/grain overlay via `::after` + SVG feTurbulence
- Custom cursor (hidden default, custom JS follower)
- Framer Motion page transitions: `opacity + y` staggerChildren pattern
- All copy using `rehype-sanitize` for XSS prevention

## Desk Pet System

Canvas-rendered pixel-art sprite (32x32 frames, 3x scale → 96px display) with 6-state machine: idle → walk → read → chat → sleep → excited. State transitions driven by user behavior events (page visibility, scroll progress, idle time). Position saved in localStorage. AI-powered conversation via `/api/pet` with a character persona ("卷卷", a film-reel-hat researcher).

## API Rate Limiting

AI endpoints should be rate-limited: max 20 requests/min per IP for `/api/pet`.

## Key Conventions from Design Doc

- Module boundaries must be clear; directory structure is a reference, not a mandate
- Discrepancies between implementation and this doc must be noted in code comments with reasoning
- Prefer code deletion over deprecation shims
- Markdown rendering happens server-side to avoid shipping unified to the client
- Images use Next.js `<Image>` with lazy loading and blur placeholders
