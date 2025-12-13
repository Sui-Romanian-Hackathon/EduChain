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
