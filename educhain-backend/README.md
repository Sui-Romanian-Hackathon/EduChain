# EduCityChain Backend

> A high-performance API server and event indexer for the EduCityChain platform built on Sui blockchain.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [API Endpoints](#api-endpoints)
- [Indexer](#indexer)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

EduCityChain Backend provides:

- **🚀 Fast API**: RESTful endpoints for querying indexed blockchain events
- **📊 Event Indexer**: Continuous polling and storage of Sui events in PostgreSQL
- **🔧 Admin Endpoints**: Optional server-side transaction signing (demo only)
- **📈 Scalability**: Designed for production use with proper error handling

The backend indexes Move events from the EduCityChain package and provides fast read access to the frontend, significantly improving query performance compared to direct blockchain queries.

---

## ✨ Features

### API Server

- ⚡ **Fast Queries**: Pre-indexed events in PostgreSQL
- 🔍 **Filtering**: Filter by event type, sender, package, module
- 📄 **Pagination**: Cursor-based pagination for large datasets
- 📚 **Swagger Documentation**: Auto-generated API docs at `/docs`
- 🛡️ **Security**: CORS, Helmet, rate limiting
- ❤️ **Health Checks**: `/health` endpoint for monitoring

### Event Indexer

- 🔄 **Continuous Polling**: Configurable interval (default: 2.5s)
- 💾 **Persistent Cursor**: Resumes from last processed event
- 🎯 **Flexible Filtering**: Filter by package, module, or event type
- 🔁 **Resilient**: Handles network errors and continues indexing
- 📊 **Event Storage**: All events stored with full metadata

### Admin Functions (Demo Only)

- 🎓 **Create Courses**: Server-side course creation (requires TeacherCap)
- 🗳️ **Create Proposals**: Server-side proposal creation (requires AdminCap)
- ⚠️ **Warning**: Not for production - use wallets/multisig instead

---

## 🏗️ Architecture

### System Components

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Sui RPC   │────────▶│   Indexer    │────────▶│  PostgreSQL │
│  (Events)   │         │   (Polls)    │         │   (Store)   │
└─────────────┘         └──────────────┘         └─────────────┘
                                                         │
                                                         ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Frontend   │────────▶│  API Server  │────────▶│  PostgreSQL │
│  (Queries)  │         │  (Fastify)    │         │   (Read)     │
└─────────────┘         └──────────────┘         └─────────────┘
```

### Folder Structure

```
educhain-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/             # Database migrations
├── src/
│   ├── api/
│   │   ├── server.ts          # Fastify server setup
│   │   ├── routes/
│   │   │   ├── health.ts      # Health check endpoint
│   │   │   ├── events.ts      # Event query endpoint
│   │   │   └── admin.ts       # Admin endpoints (demo)
│   │   └── plugins/
│   │       └── swagger.ts     # Swagger documentation
│   ├── db/
│   │   └── prisma.ts          # Prisma client
│   ├── indexer/
│   │   ├── indexer.ts         # Main indexer loop
│   │   ├── handlers.ts        # Event handlers (extensible)
│   │   └── cursor.ts          # Cursor management
│   ├── sui/
│   │   ├── client.ts          # Sui client setup
│   │   ├── filters.ts          # Event filter builders
│   │   └── adminSigner.ts     # Admin keypair (demo)
│   └── config.ts              # Configuration loader
├── docker-compose.yml          # Docker setup
├── Dockerfile                  # Container image
├── package.json
└── .env.example               # Environment template
```

---

## 🛠️ Tech Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **Fastify** | 5.6.2 | High-performance web framework |
| **@mysten/sui** | 1.45.2 | Sui blockchain SDK |
| **Prisma** | 7.1.0 | Database ORM |
| **PostgreSQL** | 16 | Database (via Docker) |
| **TypeScript** | 5.9.3 | Type-safe development |
| **Zod** | 4.1.13 | Schema validation |

### Additional Packages

- **@fastify/cors**: CORS support
- **@fastify/helmet**: Security headers
- **@fastify/rate-limit**: Rate limiting
- **@fastify/swagger**: API documentation
- **pino**: Fast logging
- **dotenv**: Environment variable management

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Docker** and **Docker Compose** (for PostgreSQL)
- **Deployed Move package** with events being emitted
- **PostgreSQL** (via Docker or standalone)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd educhain-backend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Start PostgreSQL

```bash
docker compose up -d db
```

This starts a PostgreSQL container on port `5432`.

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Configuration](#configuration) section).

### 5. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 6. Start Development Server

```bash
npm run dev
```

This starts both the API server and indexer concurrently.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=8080
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/educhain

# Sui Configuration
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_PACKAGE_ID=0x...

# Optional: Shared Object IDs
SUI_COURSE_CATALOG_ID=0x...
SUI_PROPOSAL_REGISTRY_ID=0x...

# Optional: Capability Object IDs (for admin endpoints)
SUI_TEACHER_CAP_ID=0x...
SUI_ADMIN_CAP_ID=0x...
SUI_ISSUER_CAP_ID=0x...

# Indexer Configuration
INDEXER_POLL_INTERVAL_MS=2500
INDEXER_EVENT_FILTER_MODE=package
INDEXER_MODULE_NAME=educhain
INDEXER_EVENT_TYPE=

# Optional: Admin Private Key (DEMO ONLY - not for production)
ADMIN_PRIVATE_KEY=
```

### Variable Descriptions

#### Server Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ❌ No | `development` | Environment: `development`, `production` |
| `PORT` | ❌ No | `8080` | API server port |
| `LOG_LEVEL` | ❌ No | `info` | Logging level: `debug`, `info`, `warn`, `error` |

#### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string |

#### Sui Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUI_NETWORK` | ❌ No | `testnet` | Network: `localnet`, `devnet`, `testnet`, `mainnet` |
| `SUI_RPC_URL` | ❌ No | - | Custom RPC URL (defaults to Mysten fullnodes) |
| `SUI_PACKAGE_ID` | ✅ Yes | - | Deployed Move package ID |

#### Indexer Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `INDEXER_POLL_INTERVAL_MS` | ❌ No | `2500` | Polling interval in milliseconds |
| `INDEXER_EVENT_FILTER_MODE` | ❌ No | `package` | Filter mode: `package`, `module`, `eventType` |
| `INDEXER_MODULE_NAME` | ❌ No | `educhain` | Module name for filtering |
| `INDEXER_EVENT_TYPE` | ❌ No | - | Specific event type (if using `eventType` mode) |

#### Admin Configuration (Demo Only)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMIN_PRIVATE_KEY` | ❌ No | - | Private key for server-side signing (⚠️ demo only) |

---

## 💻 Development

### Available Scripts

```bash
# Run API + Indexer concurrently
npm run dev

# Run API server only
npm run dev:api

# Run indexer only
npm run dev:indexer

# Build TypeScript
npm run build

# Start production server
npm start

# Start production indexer
npm start:indexer

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Deploy migrations (production)
npm run prisma:deploy

# Query events (utility script)
npm run query-events

# Lint code
npm run lint

# Format code
npm run format
```

### Development Workflow

1. **Start PostgreSQL**: `docker compose up -d db`
2. **Configure environment**: Copy `.env.example` to `.env` and fill values
3. **Setup database**: `npm run prisma:generate && npm run prisma:migrate`
4. **Start dev server**: `npm run dev`
5. **Check API**: Visit `http://localhost:8080/docs` for Swagger UI
6. **Monitor logs**: Check console for indexer progress

### Hot Reload

The development server uses `tsx watch` for automatic reloading on file changes.

---

## 🔌 API Endpoints

### Base URL

```
http://localhost:8080
```

### Endpoints

#### Health Check

```http
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Query Events

```http
GET /events?limit=50&cursor=123&eventType=CourseCreated
```

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | ❌ No | Results per page (1-500, default: 50) |
| `cursor` | string | ❌ No | Pagination cursor (DB ID) |
| `eventType` | string | ❌ No | Filter by event type |
| `sender` | string | ❌ No | Filter by sender address |
| `packageId` | string | ❌ No | Filter by package ID |
| `module` | string | ❌ No | Filter by module name |

**Response**:
```json
{
  "data": [
    {
      "id": "1",
      "eventType": "0x...::educhain::CourseCreated",
      "sender": "0x...",
      "packageId": "0x...",
      "transactionModule": "educhain",
      "parsedJson": {
        "course_id": "1",
        "course_object_id": "0x...",
        "creator": "0x..."
      },
      "timestampMs": "1704067200000",
      "transactionDigest": "0x...",
      "eventSeq": "0"
    }
  ],
  "nextCursor": "50"
}
```

#### Swagger Documentation

```http
GET /docs
```

Interactive API documentation with request/response schemas.

### Admin Endpoints (Demo Only)

⚠️ **Warning**: These endpoints sign transactions server-side. Use only for demos. In production, use wallets or multisig.

#### Create Course

```http
POST /admin/create-course
Content-Type: application/json

{
  "title": "Introduction to Blockchain",
  "contentUri": "ipfs://Qm..."
}
```

**Requirements**: `SUI_TEACHER_CAP_ID` and `ADMIN_PRIVATE_KEY` must be set.

#### Create Proposal

```http
POST /admin/create-proposal
Content-Type: application/json

{
  "title": "Community Garden Initiative",
  "description": "Proposal to establish a community garden..."
}
```

**Requirements**: `SUI_ADMIN_CAP_ID` and `ADMIN_PRIVATE_KEY` must be set.

---

## 📊 Indexer

### How It Works

The indexer follows Sui's recommended **poll events + store cursor** pattern:

1. **Query Events**: Calls `client.queryEvents()` with configured filter
2. **Store Events**: Saves each event to `SuiEvent` table
3. **Update Cursor**: Stores last processed `(txDigest, eventSeq)` pair
4. **Resume**: On restart, continues from last cursor
5. **Repeat**: Polls at configured interval

### Event Filtering

The indexer supports three filter modes:

#### Package Mode (Default)

Filters all events from a specific package:

```env
INDEXER_EVENT_FILTER_MODE=package
SUI_PACKAGE_ID=0x...
```

#### Module Mode

Filters events from a specific module:

```env
INDEXER_EVENT_FILTER_MODE=module
INDEXER_MODULE_NAME=educhain
```

#### Event Type Mode

Filters specific event types:

```env
INDEXER_EVENT_FILTER_MODE=eventType
INDEXER_EVENT_TYPE=0x...::educhain::CourseCreated
```

### Cursor Management

The cursor is stored in the database and tracks:
- Last processed transaction digest
- Last processed event sequence number

This ensures the indexer can resume exactly where it left off after restarts.

### Extending the Indexer

To add domain-specific handlers (e.g., upsert Courses table):

1. Edit `src/indexer/handlers.ts`
2. Add handler functions for specific event types
3. Call handlers from `src/indexer/indexer.ts`

Example:

```typescript
// handlers.ts
export async function handleCourseCreated(event: SuiEvent) {
  const data = event.parsedJson;
  // Upsert to Courses table
  await prisma.course.upsert({
    where: { courseId: data.course_id },
    update: { ... },
    create: { ... },
  });
}
```

---

## 🗄️ Database Schema

### SuiEvent Table

Stores all indexed Sui events:

| Column | Type | Description |
|--------|------|-------------|
| `id` | BigInt | Primary key (auto-increment) |
| `eventType` | String | Full event type (e.g., `0x...::educhain::CourseCreated`) |
| `sender` | String | Transaction sender address |
| `packageId` | String | Package ID that emitted the event |
| `transactionModule` | String | Module name |
| `parsedJson` | JSONB | Parsed event data |
| `timestampMs` | BigInt | Event timestamp in milliseconds |
| `transactionDigest` | String | Transaction digest |
| `eventSeq` | String | Event sequence number |
| `createdAt` | DateTime | Record creation timestamp |

### Indexes

- Primary key on `id`
- Index on `eventType`
- Index on `sender`
- Index on `packageId`
- Index on `transactionDigest` + `eventSeq` (for cursor)

---

## 🚢 Deployment

### Docker Deployment

#### Build Image

```bash
docker build -t educhain-backend:latest .
```

#### Run with Docker Compose

```bash
docker compose up -d --build
```

This starts:
- PostgreSQL database
- API server
- Indexer

#### Environment Variables in Docker

Set environment variables in `docker-compose.yml` or use `.env` file:

```yaml
services:
  backend:
    env_file:
      - .env
```

### Production Considerations

#### Database

- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- Enable backups and monitoring
- Use connection pooling

#### RPC Endpoints

- ⚠️ **Don't use public Mysten fullnodes** - they are rate-limited
- Use your own Sui fullnode or a paid RPC provider
- Configure `SUI_RPC_URL` with your endpoint

#### Security

- Remove admin endpoints in production
- Use environment-specific secrets
- Enable HTTPS
- Configure CORS properly
- Set up rate limiting
- Use firewall rules

#### Monitoring

- Monitor indexer lag (cursor vs latest events)
- Set up alerts for indexer failures
- Monitor API response times
- Track database performance

### Scaling

The backend can be scaled horizontally:

- **API Server**: Run multiple instances behind a load balancer
- **Indexer**: Run a single indexer instance (or use leader election)
- **Database**: Use read replicas for query scaling

---

## 🐛 Troubleshooting

### Common Issues

#### Indexer Not Starting

**Problem**: Indexer fails to start or crashes

**Solutions**:
- Check `SUI_PACKAGE_ID` is set correctly
- Verify RPC endpoint is accessible
- Check database connection
- Review logs for specific errors

#### Events Not Indexing

**Problem**: No events appearing in database

**Solutions**:
- Verify package is deployed and emitting events
- Check filter configuration matches your events
- Ensure indexer is running (`npm run dev:indexer`)
- Check database connection
- Verify cursor is updating

#### API Slow Responses

**Problem**: API queries are slow

**Solutions**:
- Add database indexes on frequently queried fields
- Use pagination (don't fetch all events at once)
- Consider read replicas for scaling
- Check database connection pool settings

#### Database Connection Errors

**Problem**: Cannot connect to PostgreSQL

**Solutions**:
- Verify PostgreSQL is running: `docker ps`
- Check `DATABASE_URL` is correct
- Ensure database exists: `createdb educhain`
- Check network connectivity

#### Cursor Issues

**Problem**: Indexer skipping events or duplicating

**Solutions**:
- Reset cursor: Delete last cursor entry in database
- Check cursor format matches Sui's format
- Verify event sequence numbers are correct
- Review indexer logs for cursor updates

---

## 📚 Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Sui TypeScript SDK](https://github.com/MystenLabs/sui/tree/main/sdk/typescript)
- [Fastify Documentation](https://www.fastify.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 📝 License

[Add your license information here]

---

## 🤝 Contributing

[Add contribution guidelines here]

---

**Built for scalable blockchain indexing on Sui**
