# Abyssinia Jobs

Swipe-based job matching app, built as a Telegram Web App (TWA). Job seekers swipe
on job cards; recruiters swipe on candidates for a specific opening. A mutual
right-swipe creates a Match.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, Framer Motion, Lucide React
- PostgreSQL via Prisma

## Directory Structure

```
prisma/
  schema.prisma        Accounts, Profiles, Jobs, Swipes, Matches
  seed.ts               Demo data
src/
  app/
    page.tsx            Landing / role chooser
    seeker/page.tsx      Job feed (seeker view)
    recruiter/page.tsx   Candidate feed (recruiter view)
    matches/page.tsx     Matches dashboard + Telegram chat links
    api/
      swipe/route.ts     POST: record a swipe, detect mutual match
      feed/route.ts      GET: next batch of unswiped cards
      jobs/route.ts      GET: a recruiter's job postings
      matches/route.ts   GET: matches for an account
  components/
    SwipeDeck.tsx        Draggable card stack (Framer Motion)
    JobCard.tsx / CandidateCard.tsx
    MatchModal.tsx
    TopBar.tsx
  lib/
    swipe.ts             Mutual-like match detection (transactional)
    feed.ts              Self/already-swiped exclusion queries
    prisma.ts
    types.ts
```

## Getting Started

```bash
cp .env.example .env   # set DATABASE_URL
npm install
npm run db:push         # create tables
npm run db:seed         # demo recruiter + seeker + job
npm run dev
```

Set `NEXT_PUBLIC_DEMO_SEEKER_ID` / `NEXT_PUBLIC_DEMO_RECRUITER_ID` in `.env`
to the account ids printed by the seed script (this stands in for Telegram
auth, which would otherwise populate the current user from
`window.Telegram.WebApp.initDataUnsafe.user`).

## Matching Logic

A `Swipe` row is keyed by `(actorId, subjectKey)` where `subjectKey` is the
job id for seekers, or `jobId:candidateAccountId` for recruiters — this keeps
the dedupe constraint NULL-safe in Postgres. `recordSwipe` (`src/lib/swipe.ts`)
checks for the opposing LIKE and upserts the `Match` row inside the same
transaction as the swipe, so concurrent swipes can't create duplicate or
missed matches.

## Feed Query Guarantees

`getJobFeedForSeeker` and `getCandidateFeedForJob` (`src/lib/feed.ts`) both
exclude: the viewer's own postings, and anything already present in `Swipe`
for that viewer — so a card is never shown twice.
