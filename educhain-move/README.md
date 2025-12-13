# EduCityChain Move Package

> Smart contracts for a decentralized education and civic participation platform on Sui blockchain.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Data Structures](#data-structures)
- [Entry Functions](#entry-functions)
- [Events](#events)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Building](#building)
- [Testing](#testing)
- [Deployment](#deployment)
- [Initialization](#initialization)
- [Usage Examples](#usage-examples)
- [Error Codes](#error-codes)
- [Security Considerations](#security-considerations)

---

## 🎯 Overview

EduCityChain is a Move package that implements:

- **📚 Course Management**: Shared course catalog with enrollment tracking
- **👤 User Profiles**: Owned profiles tracking education and civic achievements
- **🗳️ Governance**: Proposal registry with voting system
- **🎓 Certificates**: NFT-like certificates for completed courses
- **🔐 Access Control**: Capability-based permissions (TeacherCap, AdminCap, IssuerCap)

The package uses Sui's shared objects for multi-writer state and owned objects for user-specific data, enabling a decentralized education platform with on-chain governance.

---

## ✨ Features

### Core Functionalities

- ✅ **Profile Creation**: Users create owned Profile objects to track achievements
- ✅ **Course Management**: Teachers create courses in shared CourseCatalog
- ✅ **Enrollment System**: Students enroll in courses, earning education points
- ✅ **Result Submission**: Teachers submit student results and completion status
- ✅ **Certificate Issuance**: Issuers mint certificates for completed courses
- ✅ **Proposal Creation**: Admins create civic proposals
- ✅ **Voting System**: Users vote on proposals with anti-duplicate protection
- ✅ **Proposal Finalization**: Admins finalize proposals to close voting

### Design Patterns

- **Shared Objects**: CourseCatalog and ProposalRegistry for multi-writer state
- **Owned Objects**: Profile and Certificate for user-specific data
- **Capability Objects**: TeacherCap, AdminCap, IssuerCap for access control
- **Object Tables**: Efficient storage of courses and proposals
- **Tables**: Efficient storage of enrollments and votes
- **Events**: Comprehensive event emission for indexing

---

## 🏗️ Architecture

### Object Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Objects                            │
├─────────────────────────────────────────────────────────────┤
│ CourseCatalog                                               │
│   ├─ courses: ObjectTable<u64, Course>                     │
│   └─ enrollments: Table<EnrollmentKey, Enrollment>         │
│                                                             │
│ ProposalRegistry                                           │
│   ├─ proposals: ObjectTable<u64, Proposal>                │
│   └─ votes: Table<VoteKey, u8>                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Owned Objects                            │
├─────────────────────────────────────────────────────────────┤
│ Profile (per user)                                         │
│   ├─ owner: address                                        │
│   ├─ edu_points: u64                                       │
│   └─ civic_points: u64                                     │
│                                                             │
│ Certificate (per completion)                                │
│   ├─ student: address                                      │
│   ├─ course_id: u64                                        │
│   ├─ score: u64                                            │
│   └─ metadata_uri: String                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 Capability Objects                          │
├─────────────────────────────────────────────────────────────┤
│ TeacherCap → Create courses, submit results                │
│ AdminCap → Create proposals, finalize proposals            │
│ IssuerCap → Issue certificates                             │
└─────────────────────────────────────────────────────────────┘
```

### Module Structure

```
module educhain::educhain {
    // Errors
    // Capability structs
    // Core data structures
    // Events
    // Init function
    // Entry functions
}
```

---

## 📊 Data Structures

### Core Types

#### Profile

```move
struct Profile has key, store {
    id: UID,
    owner: address,
    edu_points: u64,
    civic_points: u64,
}
```

**Purpose**: Tracks user achievements (education and civic participation)

**Ownership**: Owned by user (one per address)

**Fields**:
- `owner`: Address that owns this profile
- `edu_points`: Points earned from course enrollments
- `civic_points`: Points earned from proposal votes

#### Course

```move
struct Course has key, store {
    id: UID,
    course_id: u64,
    creator: address,
    active: bool,
    title: String,
    content_uri: String,
}
```

**Purpose**: Represents a course in the catalog

**Storage**: Stored in `CourseCatalog.courses` (ObjectTable)

**Fields**:
- `course_id`: Unique identifier (auto-incremented)
- `creator`: Address that created the course
- `active`: Whether the course is active
- `title`: Course title
- `content_uri`: Link to course content (IPFS/Arweave/HTTPS)

#### Enrollment

```move
struct Enrollment has store, drop {
    completed: bool,
    score: u64,
    certificate_id: Option<ID>,
}
```

**Purpose**: Tracks student enrollment in a course

**Storage**: Stored in `CourseCatalog.enrollments` (Table)

**Key**: `EnrollmentKey { course_id, student }`

**Fields**:
- `completed`: Whether student completed the course
- `score`: Student's score (0-100)
- `certificate_id`: Optional certificate ID if issued

#### Proposal

```move
struct Proposal has key, store {
    id: UID,
    proposal_id: u64,
    creator: address,
    status: u8,  // 0 = open, 1 = finalized
    yes: u64,
    no: u64,
    title: String,
    description: String,
}
```

**Purpose**: Represents a civic proposal

**Storage**: Stored in `ProposalRegistry.proposals` (ObjectTable)

**Fields**:
- `proposal_id`: Unique identifier (auto-incremented)
- `creator`: Address that created the proposal
- `status`: 0 = open (accepting votes), 1 = finalized
- `yes`: Number of yes votes
- `no`: Number of no votes
- `title`: Proposal title
- `description`: Proposal description

#### Certificate

```move
struct Certificate has key, store {
    id: UID,
    student: address,
    course_id: u64,
    score: u64,
    metadata_uri: String,
}
```

**Purpose**: NFT-like certificate for completed courses

**Ownership**: Owned by student

**Fields**:
- `student`: Address that owns the certificate
- `course_id`: Course this certificate is for
- `score`: Score achieved in the course
- `metadata_uri`: Link to certificate metadata

### Shared Objects

#### CourseCatalog

```move
struct CourseCatalog has key, store {
    id: UID,
    next_course_id: u64,
    courses: ObjectTable<u64, Course>,
    enrollments: Table<EnrollmentKey, Enrollment>,
}
```

**Purpose**: Shared registry for all courses and enrollments

**Access**: Shared object (multi-writer)

**Fields**:
- `next_course_id`: Auto-incrementing course ID counter
- `courses`: Map of course_id → Course object
- `enrollments`: Map of (course_id, student) → Enrollment

#### ProposalRegistry

```move
struct ProposalRegistry has key, store {
    id: UID,
    next_proposal_id: u64,
    proposals: ObjectTable<u64, Proposal>,
    votes: Table<VoteKey, u8>,
}
```

**Purpose**: Shared registry for all proposals and votes

**Access**: Shared object (multi-writer)

**Fields**:
- `next_proposal_id`: Auto-incremented proposal ID counter
- `proposals`: Map of proposal_id → Proposal object
- `votes`: Map of (proposal_id, voter) → vote choice (0 or 1)

### Capability Objects

```move
struct TeacherCap has key, store { id: UID }
struct AdminCap has key, store { id: UID }
struct IssuerCap has key, store { id: UID }
```

**Purpose**: Access control tokens

**Ownership**: Owned by authorized addresses

**Usage**: Passed as reference (`&TeacherCap`) to prove authorization

---

## 🔧 Entry Functions

### Profile Functions

#### `create_profile`

Creates a new Profile owned by the sender.

```move
entry fun create_profile(ctx: &mut TxContext)
```

**Parameters**: None (uses `tx_context::sender`)

**Effects**:
- Creates Profile with 0 points
- Transfers Profile to sender
- Emits `ProfileCreated` event

**Access**: Public (anyone can create)

---

### Course Functions

#### `create_course`

Creates a new course in the CourseCatalog.

```move
entry fun create_course(
    teacher: &TeacherCap,
    catalog: &mut CourseCatalog,
    title: String,
    content_uri: String,
    ctx: &mut TxContext
)
```

**Parameters**:
- `teacher`: Reference to TeacherCap (proves authorization)
- `catalog`: Mutable reference to CourseCatalog
- `title`: Course title
- `content_uri`: Link to course content

**Effects**:
- Creates Course with auto-incremented ID
- Adds Course to catalog
- Emits `CourseCreated` event

**Access**: Requires TeacherCap

#### `enroll`

Enrolls a student in a course.

```move
entry fun enroll(
    catalog: &mut CourseCatalog,
    profile: &mut Profile,
    course_id: u64,
    ctx: &TxContext
)
```

**Parameters**:
- `catalog`: Mutable reference to CourseCatalog
- `profile`: Mutable reference to student's Profile
- `course_id`: ID of course to enroll in

**Effects**:
- Creates Enrollment record
- Increments `profile.edu_points` by 1
- Emits `Enrolled` event

**Access**: Public (requires Profile ownership)

**Errors**:
- `E_COURSE_NOT_FOUND`: Course doesn't exist
- `E_ALREADY_ENROLLED`: Already enrolled in this course
- `E_NOT_PROFILE_OWNER`: Profile doesn't belong to sender

#### `submit_result`

Teacher submits a student's course result.

```move
entry fun submit_result(
    teacher: &TeacherCap,
    catalog: &mut CourseCatalog,
    course_id: u64,
    student: address,
    completed: bool,
    score: u64,
    ctx: &TxContext
)
```

**Parameters**:
- `teacher`: Reference to TeacherCap
- `catalog`: Mutable reference to CourseCatalog
- `course_id`: Course ID
- `student`: Student's address
- `completed`: Whether student completed
- `score`: Student's score (0-100)

**Effects**:
- Updates Enrollment record
- Emits `ResultSubmitted` event

**Access**: Requires TeacherCap

**Errors**:
- `E_NOT_ENROLLED`: Student not enrolled

#### `issue_certificate`

Issues a certificate for a completed course.

```move
entry fun issue_certificate(
    issuer: &IssuerCap,
    catalog: &mut CourseCatalog,
    course_id: u64,
    student: address,
    metadata_uri: String,
    ctx: &mut TxContext
)
```

**Parameters**:
- `issuer`: Reference to IssuerCap
- `catalog`: Mutable reference to CourseCatalog
- `course_id`: Course ID
- `student`: Student's address
- `metadata_uri`: Certificate metadata URI

**Effects**:
- Creates Certificate object
- Links certificate to enrollment
- Transfers Certificate to student
- Emits `CertificateIssued` event

**Access**: Requires IssuerCap

**Errors**:
- `E_NOT_ENROLLED`: Student not enrolled
- `E_NOT_COMPLETED`: Course not completed
- `E_ALREADY_CERTIFIED`: Certificate already issued

---

### Proposal Functions

#### `create_proposal`

Creates a new civic proposal.

```move
entry fun create_proposal(
    admin: &AdminCap,
    registry: &mut ProposalRegistry,
    title: String,
    description: String,
    ctx: &mut TxContext
)
```

**Parameters**:
- `admin`: Reference to AdminCap
- `registry`: Mutable reference to ProposalRegistry
- `title`: Proposal title
- `description`: Proposal description

**Effects**:
- Creates Proposal with auto-incremented ID
- Sets status to OPEN
- Initializes vote counts to 0
- Emits `ProposalCreated` event

**Access**: Requires AdminCap

#### `vote`

Votes on a proposal.

```move
entry fun vote(
    registry: &mut ProposalRegistry,
    profile: &mut Profile,
    proposal_id: u64,
    choice: u8,
    ctx: &TxContext
)
```

**Parameters**:
- `registry`: Mutable reference to ProposalRegistry
- `profile`: Mutable reference to voter's Profile
- `proposal_id`: Proposal ID
- `choice`: 0 = no, 1 = yes

**Effects**:
- Records vote (prevents duplicates)
- Increments yes/no count
- Increments `profile.civic_points` by 1
- Emits `VoteCast` event

**Access**: Public (requires Profile ownership)

**Errors**:
- `E_PROPOSAL_NOT_FOUND`: Proposal doesn't exist
- `E_PROPOSAL_NOT_OPEN`: Proposal is finalized
- `E_DUPLICATE_VOTE`: Already voted on this proposal
- `E_INVALID_CHOICE`: Choice must be 0 or 1
- `E_NOT_PROFILE_OWNER`: Profile doesn't belong to sender

#### `finalize_proposal`

Finalizes a proposal (closes voting).

```move
entry fun finalize_proposal(
    admin: &AdminCap,
    registry: &mut ProposalRegistry,
    proposal_id: u64,
    ctx: &TxContext
)
```

**Parameters**:
- `admin`: Reference to AdminCap
- `registry`: Mutable reference to ProposalRegistry
- `proposal_id`: Proposal ID

**Effects**:
- Sets proposal status to FINALIZED
- Emits `ProposalFinalized` event with final counts

**Access**: Requires AdminCap

**Errors**:
- `E_PROPOSAL_NOT_FOUND`: Proposal doesn't exist

---

### Initialization

#### `init_state`

Initializes shared objects and capability objects.

```move
entry fun init_state(ctx: &mut TxContext)
```

**Purpose**: Called once after package publish to:
1. Create shared objects (CourseCatalog, ProposalRegistry)
2. Create capability objects (TeacherCap, AdminCap, IssuerCap)
3. Share the shared objects
4. Transfer capabilities to publisher
5. Emit `Initialized` event with all object IDs

**Access**: Public (typically called by deployer)

**Note**: This function emits an `Initialized` event containing all object IDs, making it easy for indexers to discover the shared objects.

---

## 📡 Events

All events are emitted for indexing and tracking:

### Profile Events

- **`ProfileCreated`**: Emitted when a profile is created
  ```move
  struct ProfileCreated has copy, drop {
      owner: address,
      profile_id: ID,
  }
  ```

### Course Events

- **`CourseCreated`**: Emitted when a course is created
  ```move
  struct CourseCreated has copy, drop {
      creator: address,
      catalog_id: ID,
      course_id: u64,
      course_object_id: ID,
  }
  ```

- **`Enrolled`**: Emitted when a student enrolls
  ```move
  struct Enrolled has copy, drop {
      student: address,
      catalog_id: ID,
      course_id: u64,
  }
  ```

- **`ResultSubmitted`**: Emitted when teacher submits result
  ```move
  struct ResultSubmitted has copy, drop {
      teacher: address,
      catalog_id: ID,
      course_id: u64,
      student: address,
      completed: bool,
      score: u64,
  }
  ```

- **`CertificateIssued`**: Emitted when certificate is issued
  ```move
  struct CertificateIssued has copy, drop {
      issuer: address,
      certificate_id: ID,
      student: address,
      course_id: u64,
      score: u64,
  }
  ```

### Proposal Events

- **`ProposalCreated`**: Emitted when proposal is created
  ```move
  struct ProposalCreated has copy, drop {
      creator: address,
      registry_id: ID,
      proposal_id: u64,
      proposal_object_id: ID,
  }
  ```

- **`VoteCast`**: Emitted when user votes
  ```move
  struct VoteCast has copy, drop {
      voter: address,
      registry_id: ID,
      proposal_id: u64,
      choice: u8,
  }
  ```

- **`ProposalFinalized`**: Emitted when proposal is finalized
  ```move
  struct ProposalFinalized has copy, drop {
      admin: address,
      registry_id: ID,
      proposal_id: u64,
      yes: u64,
      no: u64,
  }
  ```

### Initialization Event

- **`Initialized`**: Emitted during `init_state`
  ```move
  struct Initialized has copy, drop {
      publisher: address,
      course_catalog_id: ID,
      proposal_registry_id: ID,
      teacher_cap_id: ID,
      admin_cap_id: ID,
      issuer_cap_id: ID,
  }
  ```

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Sui CLI** installed ([Installation Guide](https://docs.sui.io/build/install))
- **Rust** and **Cargo** (for Move compiler)
- **Sui account** with test SUI (for deployment)
- **Move.toml** configured (already included)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd educhain-move
```

### 2. Verify Sui CLI

```bash
sui --version
```

### 3. Configure Addresses

Edit `Move.toml` if needed (default uses `0x0`):

```toml
[addresses]
educhain = "0x0"  # Will be replaced during publish
```

---

## 🏗️ Building

### Build the Package

```bash
sui move build
```

This compiles the Move code and creates bytecode in `build/` directory.

### Check for Errors

```bash
sui move build --lint
```

---

## 🧪 Testing

### Run Tests

```bash
sui move test
```

### Test Coverage

Tests are located in `tests/educhain_tests.move`:

- Profile creation tests
- Course creation and enrollment tests
- Proposal creation and voting tests
- Error condition tests
- Access control tests

### Writing Tests

Example test structure:

```move
#[test]
fun test_create_profile() {
    let ctx = &mut tx_context::dummy();
    // Test code
}
```

---

## 🚢 Deployment

### 1. Set Active Address

```bash
sui client active-address
# If not set:
sui client new-address ed25519
```

### 2. Fund Your Address

**Testnet**:
```bash
sui client faucet
```

**Devnet**: Use Discord faucet

**Localnet**: Use local faucet

### 3. Build Package

```bash
sui move build
```

### 4. Publish Package

```bash
sui client publish --gas-budget 100000000
```

**Save the output** - it contains:
- Package ID
- Object IDs for capabilities
- Transaction digest

### 5. Initialize State

After publishing, call `init_state`:

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module educhain \
  --function init_state \
  --gas-budget 100000000
```

**Save the `Initialized` event** - it contains:
- `course_catalog_id`
- `proposal_registry_id`
- `teacher_cap_id`
- `admin_cap_id`
- `issuer_cap_id`

### 6. Configure Frontend/Backend

Use the IDs from steps 4-5 to configure:
- `NEXT_PUBLIC_SUI_PACKAGE_ID`
- `NEXT_PUBLIC_COURSE_CATALOG_ID`
- `NEXT_PUBLIC_PROPOSAL_REGISTRY_ID`
- Capability IDs (for admin functions)

---

## 🔄 Initialization

### Why `init_state`?

Sui's `init` function runs during publish, but **after** objects are shared, you can't easily emit their IDs. The `init_state` function:

1. Creates shared objects
2. Shares them
3. Creates capability objects
4. Emits `Initialized` event with all IDs

This makes it easy for indexers and frontends to discover object IDs.

### Calling `init_state`

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module educhain \
  --function init_state \
  --gas-budget 100000000
```

**Important**: Only call this once after publishing!

---

## 💡 Usage Examples

### Create Profile

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module educhain \
  --function create_profile \
  --gas-budget 10000000
```

### Create Course

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module educhain \
  --function create_course \
  --args <TEACHER_CAP_ID> <COURSE_CATALOG_ID> "Introduction to Blockchain" "ipfs://Qm..." \
  --gas-budget 10000000
```

### Enroll in Course

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module educhain \
  --function enroll \
  --args <COURSE_CATALOG_ID> <PROFILE_ID> 1 \
  --gas-budget 10000000
```

### Vote on Proposal

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module educhain \
  --function vote \
  --args <PROPOSAL_REGISTRY_ID> <PROFILE_ID> 1 1 \
  --gas-budget 10000000
```

---

## ⚠️ Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| 3 | `E_NOT_PROFILE_OWNER` | Profile doesn't belong to sender |
| 4 | `E_ALREADY_ENROLLED` | Already enrolled in course |
| 5 | `E_NOT_ENROLLED` | Not enrolled in course |
| 6 | `E_DUPLICATE_VOTE` | Already voted on proposal |
| 7 | `E_PROPOSAL_NOT_OPEN` | Proposal is finalized |
| 8 | `E_NOT_COMPLETED` | Course not completed |
| 9 | `E_ALREADY_CERTIFIED` | Certificate already issued |
| 10 | `E_COURSE_NOT_FOUND` | Course doesn't exist |
| 11 | `E_PROPOSAL_NOT_FOUND` | Proposal doesn't exist |
| 12 | `E_INVALID_CHOICE` | Vote choice must be 0 or 1 |

---

## 🔒 Security Considerations

### Access Control

- **TeacherCap**: Required for creating courses and submitting results
- **AdminCap**: Required for creating/finalizing proposals
- **IssuerCap**: Required for issuing certificates
- **Profile Ownership**: Verified via `tx_context::sender`

### Anti-Duplicate Protection

- **Enrollments**: One enrollment per (course_id, student)
- **Votes**: One vote per (proposal_id, voter)

### Input Validation

- Course/proposal IDs must exist
- Vote choice must be 0 or 1
- Proposal must be open to accept votes
- Course must be completed before certificate issuance

### Best Practices

1. **Capability Distribution**: Distribute capabilities carefully (use multisig in production)
2. **Shared Object Access**: Monitor shared object access patterns
3. **Event Monitoring**: Monitor events for suspicious activity
4. **Upgrade Path**: Consider upgradeability for future improvements

---

## 📚 Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Move Language Book](https://move-language.github.io/move/)
- [Sui Move Examples](https://github.com/MystenLabs/sui/tree/main/sui_programmability/examples)
- [Sui CLI Reference](https://docs.sui.io/build/cli)

---

## 📝 License

[Add your license information here]

---

## 🤝 Contributing

[Add contribution guidelines here]

---

**Built for decentralized education and governance on Sui**
