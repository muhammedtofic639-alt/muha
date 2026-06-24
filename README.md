# Abyssinia Jobs

Swipe-based job matching app, built **natively as a Telegram Mini App**.
Authentication happens automatically via validated Telegram `initData` — there
are no passwords. New users pick a role and pass a document verification gate
before they can access the swipe decks. Job seekers swipe on job cards;
recruiters swipe on candidates (photo + 20s video pitch) for a specific
opening. A mutual right-swipe creates a Match and surfaces a direct Telegram
chat link to the other person. Seekers can also leave a 1-10 star rating for a
company.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, Framer Motion, Lucide React
- `@telegram-apps/sdk-react` for the Mini App runtime (theme, viewport, links)
- PostgreSQL via Prisma
- `jose` for JWT session cookies (issued after initData validation)

## Directory Structure

```
prisma/
  schema.prisma                Accounts, Profiles, Jobs, Swipes, Matches, CompanyRating
  seed.ts                      Demo data (approved seeker/recruiter, one pending account)
src/
  middleware.ts                Edge check: session cookie present? else -> / (re-auth)
  app/
    page.tsx                   Launch splash (Telegram initData handshake runs here)
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
      auth/telegram/route.ts    POST: validate initData, upsert account, set session
      auth/logout/route.ts      POST: clear session cookie
      onboarding/role/route.ts      POST: set Account.role
      onboarding/documents/route.ts POST: multipart upload, create/upsert profile
      ratings/route.ts          POST: upsert a 1-10 company rating; GET: aggregate
      swipe/route.ts             POST: record a swipe, detect mutual match
      feed/route.ts               GET: next batch of unswiped cards
      jobs/route.ts                GET: a recruiter's job postings
      matches/route.ts             GET: matches for an account
  components/
    DocumentUploadForm.tsx       Role-conditional document upload form
    SwipeDeck.tsx                Draggable card stack (Framer Motion)
    JobCard.tsx                  Job card with employer StarRating
    DualSlideCard.tsx            Candidate card: photo slide + 20s video slide
    StarRating.tsx                1-10 half-step rating control
    MatchModal.tsx
    TopBar.tsx
  lib/
    telegram/
      validate.ts               Server-side initData HMAC signature validation
      provider.tsx              Client SDK boot + auto-auth + theme/viewport CSS vars
      chatLink.ts               Build t.me / tg://user chat deep-links
    auth.ts                     JWT session sign/verify
    session.ts                   getCurrentAccount() for server components
    upload.ts                    Storage adapter placeholder (S3/Cloudinary)
    swipe.ts                     Mutual-like match detection (transactional)
    feed.ts                      Self/already-swiped exclusion + rating aggregation
    prisma.ts
    types.ts
```

## Getting Started

```bash
cp .env.example .env   # set DATABASE_URL, TELEGRAM_BOT_TOKEN, SESSION_SECRET
npm install
npm run db:generate     # generate the Prisma client
npm run db:push         # create tables
npm run db:seed         # demo recruiter + seeker + pending account + job
npm run dev
```

To test inside Telegram, expose the dev server (e.g. via a tunnel) and set the
URL as your bot's Mini App in @BotFather.

## Telegram Authentication & Onboarding

Authentication is fully Telegram-native — there are no passwords.

1. **Launch & auto-auth** — `TelegramProvider` (`src/lib/telegram/provider.tsx`,
   mounted in the root layout) boots `@telegram-apps/sdk-react`, reads the raw
   `initData`, and POSTs it to `/api/auth/telegram`. The server validates the
   HMAC signature (`src/lib/telegram/validate.ts`) using `TELEGRAM_BOT_TOKEN`
   and rejects launches older than 24h. On success it upserts the `Account`
   (keyed by `telegramId`) and issues a `jose` session cookie, then returns the
   path the client should route to. Opened outside Telegram, the app shows an
   "Open in Telegram" notice instead.
2. **Role selection** (`/onboarding/role`) — choose Job Seeker or Employer.
3. **Document upload** (`/onboarding/documents`) — seekers upload a Government
   ID; employers upload a Commercial License and the owner's Government ID,
   via `uploadFile()` (`src/lib/upload.ts`), a placeholder S3/Cloudinary
   adapter. Submitting (re-)sets `status = PENDING_APPROVAL`.
4. **Admin lockout** — `(protected)/layout.tsx` is a Server Component that
   loads the live `Account.status` on every request. `PENDING_APPROVAL` →
   `/pending` ("Under Review"); `REJECTED` → `/rejected`. Only `APPROVED`
   accounts reach the swipe decks.

Session JWTs (`src/lib/auth.ts`) carry only `{ accountId, role }`, never
`status` — so an admin approving/rejecting takes effect on the next request
with no re-auth. `src/middleware.ts` runs on the Edge and only checks the
session cookie (it can't reach Postgres); the live status check happens in the
Node-runtime protected layout.

## Telegram-Optimized Viewport

`TelegramProvider` mounts the SDK's theme and viewport scopes and binds them to
CSS variables. The root layout sizes itself to `--tg-viewport-stable-height`
(with a `100dvh` fallback) and pads for `--tg-safe-area-inset-*`, and the
viewport meta uses `viewport-fit=cover` — so the UI fills the Telegram webview
exactly and stays clear of the Telegram header and the device home indicator.

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
missed matches. On a match, `recordSwipe` also resolves the partner's Telegram
chat link (`src/lib/telegram/chatLink.ts`) — `t.me/<username>` when public,
else `tg://user?id=<id>` — and returns it so the `MatchModal` can offer an
instant "Message on Telegram" button (opened natively via `openTelegramLink`).
The Matches dashboard builds the same links for every prior match.

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
