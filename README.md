# Abyssinia Jobs

Swipe-based job matching app, built as a Telegram Web App (TWA). Accounts go
through an email/password signup, role selection, and a document verification
gate before they can access the swipe decks. Job seekers swipe on job cards
(photo + 20s video pitch shown to recruiters); recruiters swipe on candidates
for a specific opening. A mutual right-swipe creates a Match. Seekers can also
leave a 1-10 star rating for a company after viewing its job card.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, Framer Motion, Lucide React
- PostgreSQL via Prisma
- `bcryptjs` for password hashing, `jose` for JWT sessions

## Directory Structure

```
prisma/
  schema.prisma                Accounts, Profiles, Jobs, Swipes, Matches, CompanyRating
  seed.ts                      Demo data (approved seeker/recruiter, one pending account)
src/
  middleware.ts                Edge check: session cookie present? else -> /login
  app/
    page.tsx                   Landing page (sign up / sign in / view matches)
    (auth)/
      signup/page.tsx          Email + password signup
      login/page.tsx           Email + password login
    onboarding/
      role/page.tsx            Step 2: choose Job Seeker vs Employer
      documents/page.tsx       Step 3: upload verification documents
    pending/page.tsx           Step 4a: "Under Review" screen (PENDING_APPROVAL)
    rejected/page.tsx          Step 4b: rejection screen (REJECTED)
    (protected)/
      layout.tsx               Server-side status gate: redirects unless APPROVED
      seeker/page.tsx           Job feed (seeker view)
      recruiter/page.tsx        Candidate feed (recruiter view)
      matches/page.tsx          Matches dashboard + Telegram chat links
    api/
      auth/signup/route.ts      POST: create account (PENDING_APPROVAL)
      auth/login/route.ts       POST: verify password, set session cookie
      auth/logout/route.ts      POST: clear session cookie
      onboarding/role/route.ts      POST: set Account.role
      onboarding/documents/route.ts POST: multipart upload, create/upsert profile
      ratings/route.ts          POST: upsert a 1-10 company rating; GET: aggregate
      swipe/route.ts             POST: record a swipe, detect mutual match
      feed/route.ts               GET: next batch of unswiped cards
      jobs/route.ts                GET: a recruiter's job postings
      matches/route.ts             GET: matches for an account
  components/
    AuthForm.tsx                Shared login/signup form
    DocumentUploadForm.tsx       Role-conditional document upload form
    SwipeDeck.tsx                Draggable card stack (Framer Motion)
    JobCard.tsx                  Job card with employer StarRating
    DualSlideCard.tsx            Candidate card: photo slide + 20s video slide
    StarRating.tsx                1-10 half-step rating control
    MatchModal.tsx
    TopBar.tsx
  lib/
    auth.ts                     Password hashing + JWT session sign/verify
    session.ts                   getCurrentAccount() for server components
    upload.ts                    Storage adapter placeholder (S3/Cloudinary)
    swipe.ts                     Mutual-like match detection (transactional)
    feed.ts                      Self/already-swiped exclusion + rating aggregation
    prisma.ts
    types.ts
```

## Getting Started

```bash
cp .env.example .env   # set DATABASE_URL and SESSION_SECRET
npm install
npm run db:generate     # generate the Prisma client
npm run db:push         # create tables
npm run db:seed         # demo recruiter + seeker + pending account + job
npm run dev
```

## Verification Gate (Auth & Onboarding)

1. **Sign up** (`/signup`) — email + password, creates an `Account` with
   `status = PENDING_APPROVAL` and no role yet.
2. **Role selection** (`/onboarding/role`) — choose Job Seeker or Employer;
   sets `Account.role`.
3. **Document upload** (`/onboarding/documents`) — seekers upload a
   Government ID; employers upload a Commercial License and the owner's
   Government ID. Files go through `uploadFile()` (`src/lib/upload.ts`),
   a placeholder adapter that throws a clear error if S3/Cloudinary env vars
   are set but returns a stable placeholder URL otherwise, so the rest of the
   app is testable before real storage is wired up.
4. **Admin lockout** — `(protected)/layout.tsx` is a Server Component that
   loads the live `Account.status` from the database on every request. If it
   is `PENDING_APPROVAL`, the user is redirected to `/pending` ("Under
   Review — we will notify you via email once approved"); if `REJECTED`, to
   `/rejected`. Only `APPROVED` accounts reach `/seeker`, `/recruiter`, or
   `/matches`.

Session JWTs (`src/lib/auth.ts`) carry only `{ accountId, role }`, never
`status` — so an admin approving or rejecting an account takes effect
immediately on the next request, with no re-login required. `src/middleware.ts`
runs on the Edge and only checks that a valid session cookie exists (it can't
reach Postgres); the live status check happens in the Node-runtime protected
layout.

## Dual-Slide Swipe Cards

`DualSlideCard` (`src/components/DualSlideCard.tsx`) shows a candidate's
profile photo by default; tapping advances to a second slide with the
20-second video elevator pitch (`SeekerProfile.videoPitchUrl` /
`videoPitchSeconds`). A persistent bottom overlay shows name, headline,
skills, and `skillsDescription` on both slides. The outer card still supports
the Framer Motion drag-to-swipe gesture (LIKE right / PASS left); internal
tap-zone navigation and the drag gesture don't conflict since slide taps
produce near-zero drag offset.

## Employer Star Rating System

On a seeker's job feed, `JobCard` renders `StarRating` — a 1-to-10 control
with half-step granularity (e.g. "7.5/10"). Submitting a rating POSTs to
`/api/ratings`, which upserts a `CompanyRating` row (`@@unique([seekerId,
companyId])`) and returns the recomputed average. `getJobFeedForSeeker`
(`src/lib/feed.ts`) attaches each company's current average/count to every
job card via a `groupBy` aggregate query.

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
for that viewer — so a card is never shown twice. `getCandidateFeedForJob`
additionally only surfaces candidates who have finished uploading their
profile photo, since an empty card isn't swipeable.

## Known Limitations

- The Prisma client must be generated (`npm run db:generate`) in an
  environment with full network access to `binaries.prisma.sh` before
  `npm run dev`/`tsc` will type-check cleanly.
- The 1-10 rating CHECK constraint (`rating >= 1 AND rating <= 10`) is
  enforced in the API layer; Prisma's schema DSL can't express it, so add it
  via a raw SQL migration if you need a DB-level guarantee.
