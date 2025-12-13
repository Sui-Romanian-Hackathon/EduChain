# EduCityChain (Sui)

EduCityChain is a Sui-based dApp for **education + civic participation**:

- **📚 Courses**: teachers create courses; students enroll; teachers submit results
- **🎓 Certificates**: issuers mint NFT-like certificates for completed courses
- **🗳️ Governance**: admins create proposals; users vote; admins finalize

## Repo layout

- `educhain-move/`: Move package (on-chain logic + tests)
- `educhain-frontend/`: Next.js frontend (wallet connect + UI)
- `educhain-backend/`: Node backend (API/indexer services)

## Prerequisites

- **Sui CLI** installed (`sui --version`)
- Node.js + Yarn (for frontend/backend)

## Quickstart

### Move (contracts)

```bash
cd educhain-move
sui move build
sui move test
```

CI-grade (lint + tests, warnings as errors):

```bash
cd educhain-move
sui move --lint --warnings-are-errors test
```

### Frontend (Next.js)

```bash
cd educhain-frontend
cp env.example .env.local
yarn
yarn dev
```

### Backend (Node)

```bash
cd educhain-backend
yarn
yarn dev
```

## Notes

- Object IDs (package / shared objects / caps) produced during publish + `init_state` need to be wired into frontend/backend config.
- See `educhain-move/README.md` for contract architecture, entry functions, and deployment steps.

## Web app pages (what each one does)

The frontend is a single “Dashboard” experience with tabs. Each tab maps directly to the project’s goal: **education + civic participation** on Sui.

### Home (`/`)

- **Purpose**: landing page and quick orientation.
- **How it supports the project**: explains what EduCityChain is and directs users to the Dashboard where all on-chain interactions happen.

### Dashboard → Courses (`/dashboard?tab=courses`)

- **Purpose**: discover courses and enroll.
- **What it does**:
  - Shows courses created on-chain (shared `CourseCatalog`).
  - Lets a user enroll (writes an `Enrolled` record + updates their `Profile` points).
  - Prevents duplicate enrollment and displays enrolled/completed state derived from events.
- **Why it matters**: this is the “education” entry point and the source of proof-of-completion (enrollment + results).

### Dashboard → Proposals (`/dashboard?tab=proposals`)

- **Purpose**: participate in civic governance.
- **What it does**:
  - Lists proposals stored on-chain (shared `ProposalRegistry`).
  - Lets a user vote Yes/No (anti-duplicate voting enforced on-chain).
  - Shows vote counts and the user’s voted state derived from events.
- **Why it matters**: this is the “civic participation” entry point and the basis for transparent, auditable decision making.

### Dashboard → Profile (`/dashboard?tab=profile`)

- **Purpose**: user identity and progress.
- **What it does**:
  - Lets a user create their on-chain `Profile` (owned object).
  - Shows points (education + civic).
  - Shows enrolled courses, completed courses (with score), voted proposals (with choice), and owned certificates.
- **Why it matters**: this is the user’s portable, on-chain “record” and the place to view credentials.

### Dashboard → Admin (`/dashboard?tab=admin`)

- **Purpose**: privileged actions by role/capability.
- **What it does** (requires capability objects):
  - Create course (`TeacherCap`)
  - Submit results / mark completion (`TeacherCap`)
  - Create proposal (`AdminCap`)
  - Issue certificate (`IssuerCap`)
  - Shows the `Initialized` event info so you can verify which address received caps and which object IDs they are.
- **Why it matters**: separates roles cleanly using Sui capability objects, enabling permissioned creation/issuance while keeping consumption (enroll/vote/view) open.

## Sui Integrations (and related tooling)

This project is built end-to-end on **Sui** and uses a few Sui-native patterns across Move, the frontend, and the backend.

### On-chain (Move package)

- **Move package**: `educhain-move/` contains the `educhain::educhain` module.
- **Owned objects**:
  - `Profile`: per-user object tracking points.
  - `Certificate`: per-completion, “NFT-like” owned credential (has `metadata_uri`).
- **Shared objects** (multi-writer state):
  - `CourseCatalog`: stores courses + enrollment table.
  - `ProposalRegistry`: stores proposals + anti-duplicate voting table.
- **Capabilities (access control)**:
  - `TeacherCap` → create courses + submit results
  - `AdminCap` → create/finalize proposals
  - `IssuerCap` → issue certificates
- **Events for indexing/UI**: `Initialized`, `CourseCreated`, `Enrolled`, `ResultSubmitted`, `CertificateIssued`, `ProposalCreated`, `VoteCast`, `ProposalFinalized`.

### Frontend (wallet + transactions + reads)

- **Wallet integration**: `@mysten/dapp-kit` for connect, account access, and signing/executing transactions.
- **Transaction building**: Sui **Programmable Transaction Blocks (PTB)** via `Transaction` in `educhain-frontend/src/lib/sui.ts`.
  - Examples: `create_profile`, `enroll`, `vote`, `create_course`, `create_proposal`, `submit_result`, `issue_certificate`
- **Chain reads**:
  - Queries owned objects (e.g. `Profile`, caps, `Certificate`) via Sui RPC.
  - Queries Move events for “derived state” in UI (enrollments, completion, votes).
- **Testnet faucet**: frontend calls the official testnet faucet API in `educhain-frontend/src/components/FaucetButton.tsx`.
- **Hosted certificate metadata**: Next.js API route generates a JSON metadata document from an on-chain `Certificate` object:
  - `educhain-frontend/src/app/api/certificates/[id]/route.ts`

### Backend (indexer + API)

- **Sui event indexing**: `educhain-backend/` polls Sui RPC `queryEvents`, stores rows in Postgres (cursor-based resume), and serves them via an API.
- **Purpose**: faster event queries for the frontend (frontend falls back to chain if backend is unavailable).
- **(Demo only)** optional server-side signing endpoints exist but are not meant for production.

### Walrus / Seal

- **Not integrated** in this repo currently.
- Where they could fit:
  - **Walrus**: store course content or certificate metadata off-chain with content addressing.
  - **Seal**: encrypt gated course content / private credentials.

## Future improvement ideas

- **Course content UX**: render course content in-app (markdown/MDX) instead of only linking out via `content_uri`.
- **Walrus integration**: store course modules and certificate metadata/images as content-addressed blobs and reference them from on-chain objects.
- **Seal integration**: encrypt premium/gated course content; unlock via ownership of a certificate or an allowlist.
- **Better completion model**: add explicit “completed courses” (and certificate IDs) to `Profile`, or add dedicated events/views to avoid relying purely on event-derived state.
- **Proposal lifecycle**: expose proposal finalization and status (open/finalized) more prominently in UI; add moderation/workflow features.
- **Marketplace-friendly certificates**: add Sui `display` metadata for certificates and (optionally) kiosk/royalty patterns if trading is desired.
- **Performance**: persist derived views (courses/enrollments/results/votes) in the backend DB (not just raw events) to reduce RPC calls and improve UX at scale.
- **Security/ops**: replace any demo-style server-side signing with multisig or admin DAO flows; add rate limiting/monitoring for public deployments.
