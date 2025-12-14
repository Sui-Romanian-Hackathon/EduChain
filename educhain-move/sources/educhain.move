module educhain::educhain {
    use std::option::{Self, Option};
    use std::string::String;

    use sui::event;
    use sui::object::{Self, ID, UID};
    use sui::object_table::{Self, ObjectTable};
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // -----------------------------
    // Errors
    // -----------------------------
    const E_NOT_PROFILE_OWNER: u64 = 3;
    const E_ALREADY_ENROLLED: u64 = 4;
    const E_NOT_ENROLLED: u64 = 5;
    const E_DUPLICATE_VOTE: u64 = 6;
    const E_PROPOSAL_NOT_OPEN: u64 = 7;
    const E_NOT_COMPLETED: u64 = 8;
    const E_ALREADY_CERTIFIED: u64 = 9;
    const E_COURSE_NOT_FOUND: u64 = 10;
    const E_PROPOSAL_NOT_FOUND: u64 = 11;
    const E_INVALID_CHOICE: u64 = 12;

    // -----------------------------
    // Capability objects (access control)
    // -----------------------------
    struct TeacherCap has key, store { id: UID }
    struct AdminCap has key, store { id: UID }
    struct IssuerCap has key, store { id: UID }

    // -----------------------------
    // Core objects
    // -----------------------------
    /// A per-user profile (owned object).
    struct Profile has key, store {
        id: UID,
        owner: address,
        edu_points: u64,
        civic_points: u64,
    }

    /// A course object stored in the shared CourseCatalog via ObjectTable.
    struct Course has key, store {
        id: UID,
        course_id: u64,
        creator: address,
        active: bool,
        title: String,
        content_uri: String, // off-chain content (IPFS/S3/etc)
    }

    /// Enrollment record stored in a Table within CourseCatalog (shared).
    struct EnrollmentKey has copy, drop, store {
        course_id: u64,
        student: address,
    }

    struct Enrollment has store, drop {
        completed: bool,
        score: u64,
        certificate_id: Option<ID>,
    }

    /// The shared course catalog. Multi-writer via capability-gated functions.
    struct CourseCatalog has key, store {
        id: UID,
        next_course_id: u64,
        courses: ObjectTable<u64, Course>,
        enrollments: Table<EnrollmentKey, Enrollment>,
    }

    /// A proposal object stored in shared ProposalRegistry via ObjectTable.
    struct Proposal has key, store {
        id: UID,
        proposal_id: u64,
        creator: address,
        status: u8, // 0 open, 1 finalized
        yes: u64,
        no: u64,
        title: String,
        description: String,
    }

    const STATUS_OPEN: u8 = 0;
    const STATUS_FINALIZED: u8 = 1;

    struct VoteKey has copy, drop, store {
        proposal_id: u64,
        voter: address,
    }

    /// Shared registry for civic proposals + anti-duplicate voting.
    struct ProposalRegistry has key, store {
        id: UID,
        next_proposal_id: u64,
        proposals: ObjectTable<u64, Proposal>,
        votes: Table<VoteKey, u8>, // 1 yes, 0 no
        vote_opinions: Table<VoteKey, String>, // Optional opinions for votes
    }

    /// A certificate object (owned NFT-like credential).
    struct Certificate has key, store {
        id: UID,
        student: address,
        course_id: u64,
        score: u64,
        metadata_uri: String,
    }

    // -----------------------------
    // Events (must be copy + drop)
    // NOTE: Events cannot contain String/vector fields.
    // -----------------------------
    struct Initialized has copy, drop {
        publisher: address,
        course_catalog_id: ID,
        proposal_registry_id: ID,
        teacher_cap_id: ID,
        admin_cap_id: ID,
        issuer_cap_id: ID,
    }

    struct ProfileCreated has copy, drop {
        owner: address,
        profile_id: ID,
    }

    struct CourseCreated has copy, drop {
        creator: address,
        catalog_id: ID,
        course_id: u64,
        course_object_id: ID,
    }

    struct Enrolled has copy, drop {
        student: address,
        catalog_id: ID,
        course_id: u64,
    }

    struct ResultSubmitted has copy, drop {
        teacher: address,
        catalog_id: ID,
        course_id: u64,
        student: address,
        completed: bool,
        score: u64,
    }

    struct CertificateIssued has copy, drop {
        issuer: address,
        certificate_id: ID,
        student: address,
        course_id: u64,
        score: u64,
    }

    struct ProposalCreated has copy, drop {
        creator: address,
        registry_id: ID,
        proposal_id: u64,
        proposal_object_id: ID,
    }

    struct VoteCast has copy, drop {
        voter: address,
        registry_id: ID,
        proposal_id: u64,
        choice: u8, // 1 yes, 0 no
    }

    struct ProposalFinalized has copy, drop {
        admin: address,
        registry_id: ID,
        proposal_id: u64,
        yes: u64,
        no: u64,
    }

    // -----------------------------
    // Module init: runs at publish
    // -----------------------------
    fun init(_ctx: &mut TxContext) {
        // Intentionally empty.
        // We initialize state with the `init_state` entry function so we can emit IDs for indexers.
    }

    /// OPTIONAL: call this once post-publish to create + share shared objects and emit their IDs.
    entry fun init_state(ctx: &mut TxContext) {
        let publisher = tx_context::sender(ctx);

        let teacher_cap = TeacherCap { id: object::new(ctx) };
        let admin_cap = AdminCap { id: object::new(ctx) };
        let issuer_cap = IssuerCap { id: object::new(ctx) };

        let catalog = CourseCatalog {
            id: object::new(ctx),
            next_course_id: 1,
            courses: object_table::new<u64, Course>(ctx),
            enrollments: table::new<EnrollmentKey, Enrollment>(ctx),
        };

        let registry = ProposalRegistry {
            id: object::new(ctx),
            next_proposal_id: 1,
            proposals: object_table::new<u64, Proposal>(ctx),
            votes: table::new<VoteKey, u8>(ctx),
            vote_opinions: table::new<VoteKey, String>(ctx),
        };

        // object::id expects a reference
        let catalog_id = object::id(&catalog);
        let registry_id = object::id(&registry);
        let teacher_cap_id = object::id(&teacher_cap);
        let admin_cap_id = object::id(&admin_cap);
        let issuer_cap_id = object::id(&issuer_cap);

        transfer::share_object(catalog);
        transfer::share_object(registry);

        transfer::transfer(teacher_cap, publisher);
        transfer::transfer(admin_cap, publisher);
        transfer::transfer(issuer_cap, publisher);

        event::emit(Initialized {
            publisher,
            course_catalog_id: catalog_id,
            proposal_registry_id: registry_id,
            teacher_cap_id,
            admin_cap_id,
            issuer_cap_id,
        });
    }

    // -----------------------------
    // entry functions
    // -----------------------------
    /// Create a Profile owned by sender.
    entry fun create_profile(ctx: &mut TxContext) {
        let owner = tx_context::sender(ctx);
        let profile = Profile {
            id: object::new(ctx),
            owner,
            edu_points: 0,
            civic_points: 0,
        };
        let pid = object::id(&profile);
        transfer::transfer(profile, owner);
        event::emit(ProfileCreated { owner, profile_id: pid });
    }

    /// Teacher creates a course and stores it under CourseCatalog.
    entry fun create_course(
        teacher: &TeacherCap,
        catalog: &mut CourseCatalog,
        title: String,
        content_uri: String,
        ctx: &mut TxContext
    ) {
        // Prove caller controls TeacherCap by requiring a &TeacherCap input.
        let _ = teacher;

        let creator = tx_context::sender(ctx);
        let course_id = catalog.next_course_id;
        catalog.next_course_id = course_id + 1;

        let course = Course {
            id: object::new(ctx),
            course_id,
            creator,
            active: true,
            title,
            content_uri,
        };
        let course_object_id = object::id(&course);

        object_table::add(&mut catalog.courses, course_id, course);

        event::emit(CourseCreated {
            creator,
            catalog_id: object::id(catalog),
            course_id,
            course_object_id,
        });
    }

    /// Student enrolls in a course. Requires the student's Profile for per-user points.
    /// ctx is not mutated here, so it is &TxContext (not &mut).
    entry fun enroll(
        catalog: &mut CourseCatalog,
        profile: &mut Profile,
        course_id: u64,
        ctx: &TxContext
    ) {
        let student = tx_context::sender(ctx);
        assert!(profile.owner == student, E_NOT_PROFILE_OWNER);

        // Ensure course exists
        assert!(object_table::contains(&catalog.courses, course_id), E_COURSE_NOT_FOUND);

        let key = EnrollmentKey { course_id, student };
        assert!(!table::contains(&catalog.enrollments, key), E_ALREADY_ENROLLED);

        table::add(&mut catalog.enrollments, key, Enrollment {
            completed: false,
            score: 0,
            certificate_id: option::none<ID>(),
        });

        profile.edu_points = profile.edu_points + 1;

        event::emit(Enrolled {
            student,
            catalog_id: object::id(catalog),
            course_id,
        });
    }

    /// Teacher sets a student's result (score + completed). Requires TeacherCap.
    /// ctx is not mutated here, so it is &TxContext (not &mut).
    entry fun submit_result(
        teacher: &TeacherCap,
        catalog: &mut CourseCatalog,
        course_id: u64,
        student: address,
        completed: bool,
        score: u64,
        ctx: &TxContext
    ) {
        let _ = teacher;
        let teacher_addr = tx_context::sender(ctx);

        let key = EnrollmentKey { course_id, student };
        assert!(table::contains(&catalog.enrollments, key), E_NOT_ENROLLED);

        let enr = table::borrow_mut(&mut catalog.enrollments, key);
        enr.completed = completed;
        enr.score = score;

        event::emit(ResultSubmitted {
            teacher: teacher_addr,
            catalog_id: object::id(catalog),
            course_id,
            student,
            completed,
            score,
        });
    }

    /// Issuer mints a Certificate to `student` if completion exists.
    entry fun issue_certificate(
        issuer: &IssuerCap,
        catalog: &mut CourseCatalog,
        course_id: u64,
        student: address,
        metadata_uri: String,
        ctx: &mut TxContext
    ) {
        let _ = issuer;
        let issuer_addr = tx_context::sender(ctx);

        let key = EnrollmentKey { course_id, student };
        assert!(table::contains(&catalog.enrollments, key), E_NOT_ENROLLED);

        let enr = table::borrow_mut(&mut catalog.enrollments, key);
        assert!(enr.completed, E_NOT_COMPLETED);
        assert!(option::is_none(&enr.certificate_id), E_ALREADY_CERTIFIED);

        let cert = Certificate {
            id: object::new(ctx),
            student,
            course_id,
            score: enr.score,
            metadata_uri,
        };
        let cert_id = object::id(&cert);

        enr.certificate_id = option::some(cert_id);

        transfer::transfer(cert, student);

        event::emit(CertificateIssued {
            issuer: issuer_addr,
            certificate_id: cert_id,
            student,
            course_id,
            score: enr.score,
        });
    }

    /// Admin creates a civic proposal (open by default).
    entry fun create_proposal(
        admin: &AdminCap,
        registry: &mut ProposalRegistry,
        title: String,
        description: String,
        ctx: &mut TxContext
    ) {
        let _ = admin;
        let creator = tx_context::sender(ctx);

        let proposal_id = registry.next_proposal_id;
        registry.next_proposal_id = proposal_id + 1;

        let p = Proposal {
            id: object::new(ctx),
            proposal_id,
            creator,
            status: STATUS_OPEN,
            yes: 0,
            no: 0,
            title,
            description,
        };
        let proposal_object_id = object::id(&p);

        object_table::add(&mut registry.proposals, proposal_id, p);

        event::emit(ProposalCreated {
            creator,
            registry_id: object::id(registry),
            proposal_id,
            proposal_object_id,
        });
    }

    /// Citizen votes (anti-duplicate).
    /// ctx is not mutated here, so it is &TxContext (not &mut).
    entry fun vote(
        registry: &mut ProposalRegistry,
        profile: &mut Profile,
        proposal_id: u64,
        choice: u8,
        ctx: &TxContext
    ) {
        vote_with_opinion(registry, profile, proposal_id, choice, option::none<String>(), ctx);
    }

    /// Citizen votes with optional opinion (anti-duplicate).
    /// ctx is not mutated here, so it is &TxContext (not &mut).
    entry fun vote_with_opinion(
        registry: &mut ProposalRegistry,
        profile: &mut Profile,
        proposal_id: u64,
        choice: u8,
        opinion: Option<String>,
        ctx: &TxContext
    ) {
        let voter = tx_context::sender(ctx);
        assert!(profile.owner == voter, E_NOT_PROFILE_OWNER);

        assert!(object_table::contains(&registry.proposals, proposal_id), E_PROPOSAL_NOT_FOUND);
        let prop = object_table::borrow_mut(&mut registry.proposals, proposal_id);
        assert!(prop.status == STATUS_OPEN, E_PROPOSAL_NOT_OPEN);

        // choice must be 0 or 1
        assert!(choice == 0 || choice == 1, E_INVALID_CHOICE);

        let key = VoteKey { proposal_id, voter };
        assert!(!table::contains(&registry.votes, key), E_DUPLICATE_VOTE);

        table::add(&mut registry.votes, key, choice);

        // Store opinion if provided
        if (option::is_some(&opinion)) {
            let opinion_val = option::extract(&mut opinion);
            table::add(&mut registry.vote_opinions, key, opinion_val);
        };

        if (choice == 1) {
            prop.yes = prop.yes + 1;
        } else {
            prop.no = prop.no + 1;
        };

        profile.civic_points = profile.civic_points + 1;

        event::emit(VoteCast {
            voter,
            registry_id: object::id(registry),
            proposal_id,
            choice,
        });
    }

    /// Admin finalizes proposal (no more votes).
    /// ctx is not mutated here, so it is &TxContext (not &mut).
    entry fun finalize_proposal(
        admin: &AdminCap,
        registry: &mut ProposalRegistry,
        proposal_id: u64,
        ctx: &TxContext
    ) {
        let _ = admin;
        let admin_addr = tx_context::sender(ctx);

        // Compute ID before taking a mutable borrow into registry.proposals
        let registry_id = object::id(registry);

        assert!(object_table::contains(&registry.proposals, proposal_id), E_PROPOSAL_NOT_FOUND);
        let prop = object_table::borrow_mut(&mut registry.proposals, proposal_id);
        assert!(prop.status == STATUS_OPEN, E_PROPOSAL_NOT_OPEN);

        prop.status = STATUS_FINALIZED;

        // Copy out fields before emitting (avoids borrow issues)
        let yes = prop.yes;
        let no = prop.no;

        event::emit(ProposalFinalized {
            admin: admin_addr,
            registry_id,
            proposal_id,
            yes,
            no,
        });
    }
}
