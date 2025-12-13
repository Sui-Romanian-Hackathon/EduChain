# EduCityChain Frontend

> A modern, responsive Next.js frontend for the EduCityChain decentralized education platform built on Sui blockchain.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Key Functionalities](#key-functionalities)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

EduCityChain Frontend is a full-featured web application that enables users to:

- **Connect Sui wallets** and manage their blockchain identity
- **Create and manage profiles** that track learning and civic achievements
- **Browse and enroll in courses** stored on-chain
- **Vote on civic proposals** and participate in governance
- **View achievements** including education points, civic points, enrollments, course completion (with scores), and certificates
- **Admin functions** for creating courses and proposals (requires capability objects)

The frontend seamlessly integrates with the Sui blockchain using `@mysten/dapp-kit` and can optionally use a backend API for faster event queries.

---

## ✨ Features

### Core Features

- 🔐 **Wallet Integration**: Connect with Sui Wallet, Ethos Wallet, or any Sui-compatible wallet
- 👤 **Profile Management**: Create on-chain profiles that track your achievements
- 📚 **Course Browsing**: Search and filter courses with real-time updates
- 🎓 **Course Enrollment**: One-click enrollment that updates your profile and earns education points
- 🗳️ **Proposal Voting**: Vote on civic proposals with anti-duplicate protection
- 📊 **Achievement Tracking**: View education points, civic points, enrolled courses, completed courses (with score), voted proposals (with choice), and certificates
- 🔧 **Admin Panel**: Create courses/proposals, submit results, and issue certificates (requires capability objects)

### User Experience

- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Built with Mantine UI components for a polished experience
- ⚡ **Fast Loading**: Optimized queries with React Query caching
- 🔔 **Notifications**: Toast notifications for all transaction states
- ⚠️ **Gas Balance Alerts**: Automatic warnings when gas balance is low
- 🔄 **Auto-refresh**: Automatic data updates after transactions

### Technical Features

- **Dual Data Sources**: Falls back from backend API to direct blockchain queries
- **Transaction Building**: Uses Sui Programmable Transaction Blocks (PTB)
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error messages and recovery suggestions

---

## 🛠️ Tech Stack

### Core Dependencies

| Package | Version | Purpose |
|--------|---------|---------|
| **Next.js** | 14.2.35 | React framework with SSR support |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.6.3 | Type-safe development |
| **Mantine** | 7.17.8 | UI component library |
| **@mysten/dapp-kit** | 0.19.6 | Sui wallet integration |
| **@mysten/sui** | 1.45.2 | Sui blockchain SDK |
| **@tanstack/react-query** | 5.90.12 | Data fetching and caching |

### UI Components

- **Mantine Core**: Buttons, Cards, Forms, Navigation
- **Mantine Hooks**: State management utilities
- **Mantine Notifications**: Toast notifications
- **Tabler Icons**: Icon library

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Sui Wallet** browser extension (for testing)
- **Deployed Move package** with shared objects initialized
- (Optional) **Backend API** running for faster event queries

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd educhain-frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration (see [Configuration](#configuration) section).

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at **http://localhost:3000**

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required: Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet

# Required: Deployed Package ID
NEXT_PUBLIC_SUI_PACKAGE_ID=0x...

# Required: Shared Object IDs (from init_state Initialized event)
NEXT_PUBLIC_COURSE_CATALOG_ID=0x...
NEXT_PUBLIC_PROPOSAL_REGISTRY_ID=0x...

# Optional: Custom RPC URL
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Optional: Backend API URL (for faster event queries)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### Variable Descriptions

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUI_NETWORK` | ✅ Yes | Network: `localnet`, `devnet`, `testnet`, or `mainnet` |
| `NEXT_PUBLIC_SUI_PACKAGE_ID` | ✅ Yes | Deployed Move package ID |
| `NEXT_PUBLIC_COURSE_CATALOG_ID` | ✅ Yes | CourseCatalog shared object ID |
| `NEXT_PUBLIC_PROPOSAL_REGISTRY_ID` | ✅ Yes | ProposalRegistry shared object ID |
| `NEXT_PUBLIC_SUI_RPC_URL` | ❌ No | Custom RPC endpoint (defaults to Mysten fullnodes) |
| `NEXT_PUBLIC_BACKEND_URL` | ❌ No | Backend API URL for indexed events |

**⚠️ Important**: After changing `.env.local`, you must **restart** the development server for changes to take effect.

---

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check without building
npm run type-check
```

### Development Workflow

1. **Start the dev server**: `npm run dev`
2. **Open browser**: Navigate to `http://localhost:3000`
3. **Connect wallet**: Use Sui Wallet extension
4. **Get test tokens**: Use the faucet button (testnet/devnet)
5. **Create profile**: Navigate to Profile tab
6. **Start using**: Enroll in courses, vote on proposals

### Hot Reload

The development server supports hot module replacement (HMR). Changes to components will automatically refresh in the browser.

---

## 🏗️ Building for Production

### Build Process

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Build Output

The build process creates:
- Optimized JavaScript bundles
- Static HTML pages (where applicable)
- Optimized CSS
- Type definitions

### Deployment

The application can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Any Node.js hosting** (requires `npm run build` and `npm start`)

### Environment Variables in Production

Ensure all `NEXT_PUBLIC_*` variables are set in your hosting platform's environment configuration.

---

## 📁 Project Structure

```
educhain-frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── providers.tsx      # React Query & Sui providers
│   ├── components/            # React components
│   │   ├── panels/            # Feature panels
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── CoursesPanel.tsx
│   │   │   ├── ProfilePanel.tsx
│   │   │   └── ProposalsPanel.tsx
│   │   ├── AppShellLayout.tsx # Main layout wrapper
│   │   ├── ConfigAlert.tsx    # Configuration warnings
│   │   ├── FaucetButton.tsx   # Test token faucet
│   │   ├── GasBalanceAlert.tsx # Low balance warnings
│   │   └── HeaderBar.tsx      # Top navigation bar
│   └── lib/                   # Utilities and hooks
│       ├── config.ts          # Configuration loader
│       ├── sui.ts             # Transaction builders
│       ├── types.ts           # TypeScript types
│       ├── useCourses.ts      # Course data hook
│       ├── useProfile.ts      # Profile data hook
│       ├── useProposals.ts    # Proposal data hook
│       └── useCaps.ts         # Capability objects hook
├── public/                    # Static assets
├── env.example               # Environment template
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript configuration
```

---

## 🔑 Key Functionalities

### 1. Wallet Connection

**Location**: Header bar (desktop) or sidebar (mobile)

- Click "Connect Wallet" button
- Select your Sui wallet from the modal
- Approve connection in wallet extension
- Wallet address appears in header

**Features**:
- Copy address to clipboard
- Disconnect wallet
- Network badge display

### 2. Profile Management

**Location**: Profile tab (`/dashboard?tab=profile`)

**Create Profile**:
- Click "Create Profile" button
- Approve transaction in wallet
- Profile object created on-chain
- Initial points: 0 education, 0 civic

**View Profile**:
- Education points (earned from enrollments)
- Civic points (earned from votes)
- Enrolled courses list (derived from `Enrolled` events)
- Completed courses + score (derived from `ResultSubmitted` events)
- Voted proposals + choice (derived from `VoteCast` events)
- Certificates owned by the wallet (owned `Certificate` objects)
- Profile object ID

### 3. Course Management

**Location**: Courses tab (`/dashboard?tab=courses`)

**Browse Courses**:
- Grid layout with course cards
- Search by title
- Filter by completion status
- View course details (title, content URI, ID)

**Enroll in Course**:
- Click "Enroll" button on course card
- Approve transaction
- Education points increase by 1
- Enrollment recorded on-chain

**Prerequisites**: Must have a Profile created

### 4. Proposal Voting

**Location**: Proposals tab (`/dashboard?tab=proposals`)

**Browse Proposals**:
- Grid layout with proposal cards
- Search by title
- View proposal details (title, description)
- See voting progress (Yes/No counts, progress bar)

**Vote on Proposal**:
- Click "Yes" or "No" button
- Approve transaction
- Civic points increase by 1
- Vote recorded on-chain (anti-duplicate)

**Prerequisites**: Must have a Profile created

### 5. Admin Functions

**Location**: Admin tab (`/dashboard?tab=admin`)

**Create Course** (requires TeacherCap):
- Enter course title
- Enter content URI (IPFS/Arweave/HTTPS)
- Click "Create course"
- Course added to CourseCatalog

**Create Proposal** (requires AdminCap):
- Enter proposal title
- Enter description
- Click "Create proposal"
- Proposal added to ProposalRegistry

**Submit result / mark completed** (requires TeacherCap):
- Select course from dropdown
- Enter student address + score
- Click "Submit result"
- Completion is reflected in UI via `ResultSubmitted` events

**Issue certificate** (requires IssuerCap):
- Select course from dropdown
- Enter student address
- (Optional) metadata URI
- Click "Issue certificate"
- Certificate is an owned object; it appears in Profile → Certificates

### 6. Gas Management

**Faucet Integration**:
- "Get Test SUI" button in header
- Automatic address copying
- Network-specific instructions
- Testnet: API or Discord command
- Devnet: Discord command
- Localnet: CLI command

**Balance Monitoring**:
- Automatic balance checking
- Low balance alerts (< 0.1 SUI)
- Balance display in notifications

---

## 🔍 How It Works

### Data Fetching Strategy

The frontend uses a **dual-source approach**:

1. **Primary**: Backend API (if `NEXT_PUBLIC_BACKEND_URL` is set)
   - Faster event queries
   - Indexed data
   - Falls back to chain if unavailable

2. **Fallback**: Direct Sui RPC queries
   - Always available
   - Direct blockchain access
   - Used when backend is unavailable

### Object Discovery

The app automatically discovers:

- **Profiles**: Queries owned objects by type `Profile`
- **Capabilities**: Queries owned objects by type `TeacherCap`, `AdminCap`, `IssuerCap`
- **Courses**: Reads from `CourseCatalog` shared object
- **Proposals**: Reads from `ProposalRegistry` shared object
- **Certificates**: Queries owned objects by type `Certificate`

### Certificate metadata

Certificates store an on-chain `metadata_uri` string (optional). For convenience during demos, the frontend also exposes a hosted metadata endpoint:

- `GET /api/certificates/<certificateObjectId>`

This returns a JSON metadata document generated from the on-chain `Certificate` fields.

### Transaction Building

All transactions use Sui **Programmable Transaction Blocks (PTB)**:

```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::educhain::enroll`,
  arguments: [catalog, profile, courseId],
});
```

Transactions are signed and executed via `useSignAndExecuteTransaction()` hook, which prompts the user's wallet.

---

## 🐛 Troubleshooting

### Common Issues

#### Wallet Not Connecting

**Problem**: Wallet connection fails or doesn't appear

**Solutions**:
- Ensure wallet extension is installed and unlocked
- Refresh the page
- Check browser console for errors
- Try a different wallet

#### Profile Not Found

**Problem**: "No Profile found" message

**Solutions**:
- Create a profile using "Create Profile" button
- Ensure wallet is connected
- Check you have sufficient SUI for gas

#### Transactions Failing

**Problem**: Transactions fail with errors

**Solutions**:
- Check gas balance (use faucet if needed)
- Verify network matches your wallet
- Ensure all required objects exist
- Check transaction in Sui Explorer

#### Low Gas Balance

**Problem**: Yellow alert about low balance

**Solutions**:
- Click "Get Test SUI" button
- Follow faucet instructions for your network
- Wait for tokens to arrive (may take a few minutes)

#### Configuration Errors

**Problem**: Red alerts about missing configuration

**Solutions**:
- Verify all required env vars are set in `.env.local`
- Restart dev server after changing env vars
- Check object IDs are correct (from `init_state` event)

#### Backend Not Responding

**Problem**: Slow loading or backend errors

**Solutions**:
- Backend is optional - app falls back to chain queries
- Check `NEXT_PUBLIC_BACKEND_URL` is correct
- Verify backend is running (if using)
- App will continue working with direct chain queries

---

## 📚 Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [dApp Kit Documentation](https://sui-typescript-docs.vercel.app/dapp-kit)
- [Mantine UI Components](https://mantine.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 📝 License

[Add your license information here]

---

## 🤝 Contributing

[Add contribution guidelines here]

---

**Built with ❤️ for decentralized education on Sui**
