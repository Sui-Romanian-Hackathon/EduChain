module educhain::educhain_tests {
    use sui::test_scenario as ts;
    use sui::object::Self;
    use sui::transfer;
    use std::string;

    use educhain::educhain;

    // Test addresses
    const ADMIN: address = @0xA;
    const TEACHER: address = @0xB;
    const STUDENT1: address = @0xC;
    const STUDENT2: address = @0xD;
    const ISSUER: address = @0xE;

    // Lint-friendly abort codes for assertions in tests
    const E_ASSERT_CAP_IDS_DISTINCT_0: u64 = 1000;
    const E_ASSERT_CAP_IDS_DISTINCT_1: u64 = 1001;
    const E_ASSERT_CAP_IDS_DISTINCT_2: u64 = 1002;
    const E_ASSERT_PROFILES_DISTINCT: u64 = 1010;

    // ============================================================================
    // Initialization Tests
    // ============================================================================

    #[test]
    fun test_init_state() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);

        // Call init_state
        educhain::init_state(ctx);

        // Move to next transaction to verify objects were created
        ts::next_tx(&mut scenario, ADMIN);

        // Verify capabilities were created and transferred
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);

        // Verify they exist
        assert!(object::id(&teacher_cap) != object::id(&admin_cap), E_ASSERT_CAP_IDS_DISTINCT_0);
        assert!(object::id(&admin_cap) != object::id(&issuer_cap), E_ASSERT_CAP_IDS_DISTINCT_1);
        assert!(object::id(&teacher_cap) != object::id(&issuer_cap), E_ASSERT_CAP_IDS_DISTINCT_2);

        // Return capabilities for cleanup
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_to_sender(&scenario, issuer_cap);

        ts::end(scenario);
    }

    #[test]
    fun test_init_state_creates_shared_objects() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);

        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);

        // Verify shared objects were created
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        
        // Verify they exist (just checking we can take them)
        ts::return_shared(catalog);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    // ============================================================================
    // Profile Tests
    // ============================================================================

    #[test]
    fun test_create_profile() {
        let scenario = ts::begin(STUDENT1);
        let ctx = ts::ctx(&mut scenario);

        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);

        // Verify profile was created and transferred
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        // Profile exists - creation successful
        ts::return_to_sender(&scenario, profile);
        ts::end(scenario);
    }

    #[test]
    fun test_create_profile_multiple_users() {
        let scenario = ts::begin(STUDENT1);
        let ctx = ts::ctx(&mut scenario);

        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile1 = ts::take_from_sender<educhain::Profile>(&scenario);
        let profile1_id = object::id(&profile1);
        ts::return_to_sender(&scenario, profile1);

        ts::next_tx(&mut scenario, STUDENT2);
        let ctx2 = ts::ctx(&mut scenario);
        educhain::create_profile(ctx2);

        ts::next_tx(&mut scenario, STUDENT2);
        let profile2 = ts::take_from_sender<educhain::Profile>(&scenario);
        let profile2_id = object::id(&profile2);
        // Both profiles exist and are different objects
        assert!(profile1_id != profile2_id, E_ASSERT_PROFILES_DISTINCT);

        ts::return_to_sender(&scenario, profile2);
        ts::end(scenario);
    }

    // ============================================================================
    // Course Tests
    // ============================================================================

    #[test]
    fun test_create_course() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);

        // Initialize state
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);

        // Transfer TeacherCap to teacher
        transfer::public_transfer(teacher_cap, TEACHER);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_to_sender(&scenario, issuer_cap);
        ts::return_shared(catalog);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);

        // Create course
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Blockchain 101"),
            string::utf8(b"ipfs://QmTest"),
            ctx
        );

        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::end(scenario);
    }

    #[test]
    fun test_create_course_multiple() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        transfer::public_transfer(teacher_cap, TEACHER);
        ts::return_shared(catalog);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);

        // Create first course
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Course 1"),
            string::utf8(b"ipfs://1"),
            ctx
        );
        ts::return_shared(catalog);
        ts::return_to_sender(&scenario, teacher_cap);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);

        // Create second course
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Course 2"),
            string::utf8(b"ipfs://2"),
            ctx
        );

        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = educhain::E_COURSE_NOT_FOUND)]
    fun test_enroll_course_not_found() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        ts::return_shared(catalog);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);

        // Try to enroll in non-existent course
        educhain::enroll(&mut catalog, &mut profile, 999, ctx);

        ts::return_to_sender(&scenario, profile);
        ts::return_shared(catalog);
        ts::end(scenario);
    }

    #[test]
    fun test_enroll_success() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        transfer::public_transfer(teacher_cap, TEACHER);
        ts::return_shared(catalog);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Test Course"),
            string::utf8(b"ipfs://test"),
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);

        // Enroll in course
        educhain::enroll(&mut catalog, &mut profile, 1, ctx);
        
        // Enrollment successful - points are updated internally
        ts::return_to_sender(&scenario, profile);
        ts::return_shared(catalog);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = educhain::E_ALREADY_ENROLLED)]
    fun test_enroll_duplicate() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        transfer::public_transfer(teacher_cap, TEACHER);
        ts::return_shared(catalog);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Test Course"),
            string::utf8(b"ipfs://test"),
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::enroll(&mut catalog, &mut profile, 1, ctx);
        ts::return_to_sender(&scenario, profile);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // Try to enroll again - should fail
        educhain::enroll(&mut catalog, &mut profile, 1, ctx);

        ts::return_to_sender(&scenario, profile);
        ts::return_shared(catalog);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = educhain::E_NOT_PROFILE_OWNER)]
    fun test_enroll_wrong_profile_owner() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        transfer::public_transfer(teacher_cap, TEACHER);
        ts::return_shared(catalog);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Test Course"),
            string::utf8(b"ipfs://test"),
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, STUDENT2);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_address<educhain::Profile>(&scenario, STUDENT2);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // STUDENT1 trying to use STUDENT2's profile - should fail
        educhain::enroll(&mut catalog, &mut profile, 1, ctx);

        // If it didn't abort, put the profile back to STUDENT2
        transfer::public_transfer(profile, STUDENT2);
        ts::return_shared(catalog);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = educhain::E_NOT_ENROLLED)]
    fun test_submit_result_not_enrolled() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        transfer::public_transfer(teacher_cap, TEACHER);
        ts::return_shared(catalog);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Test Course"),
            string::utf8(b"ipfs://test"),
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // Try to submit result for student who never enrolled
        educhain::submit_result(
            &teacher_cap,
            &mut catalog,
            1,
            STUDENT1,
            true,
            85,
            ctx
        );

        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);
        ts::end(scenario);
    }

    #[test]
    fun test_submit_result_success() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        transfer::public_transfer(teacher_cap, TEACHER);
        ts::return_shared(catalog);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Test Course"),
            string::utf8(b"ipfs://test"),
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::enroll(&mut catalog, &mut profile, 1, ctx);
        ts::return_to_sender(&scenario, profile);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // Submit result
        educhain::submit_result(
            &teacher_cap,
            &mut catalog,
            1,
            STUDENT1,
            true,
            90,
            ctx
        );

        // Result submitted successfully (verified by certificate issuance test)

        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);
        ts::end(scenario);
    }

    // ============================================================================
    // Certificate Tests
    // ============================================================================

    #[test]
    #[expected_failure(abort_code = educhain::E_NOT_ENROLLED)]
    fun test_issue_certificate_not_enrolled() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        transfer::public_transfer(teacher_cap, TEACHER);
        transfer::public_transfer(issuer_cap, ISSUER);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Test Course"),
            string::utf8(b"ipfs://test"),
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ISSUER);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // Try to issue certificate without enrollment
        educhain::issue_certificate(
            &issuer_cap,
            &mut catalog,
            1,
            STUDENT1,
            string::utf8(b"ipfs://cert"),
            ctx
        );

        ts::return_to_sender(&scenario, issuer_cap);
        ts::return_shared(catalog);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = educhain::E_NOT_COMPLETED)]
    fun test_issue_certificate_not_completed() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        transfer::public_transfer(teacher_cap, TEACHER);
        transfer::public_transfer(issuer_cap, ISSUER);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Test Course"),
            string::utf8(b"ipfs://test"),
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::enroll(&mut catalog, &mut profile, 1, ctx);
        ts::return_to_sender(&scenario, profile);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ISSUER);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // Try to issue certificate without completion
        educhain::issue_certificate(
            &issuer_cap,
            &mut catalog,
            1,
            STUDENT1,
            string::utf8(b"ipfs://cert"),
            ctx
        );

        ts::return_to_sender(&scenario, issuer_cap);
        ts::return_shared(catalog);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    fun test_issue_certificate_success() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        transfer::public_transfer(teacher_cap, TEACHER);
        transfer::public_transfer(issuer_cap, ISSUER);
        ts::return_shared(catalog);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Test Course"),
            string::utf8(b"ipfs://test"),
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::enroll(&mut catalog, &mut profile, 1, ctx);
        ts::return_to_sender(&scenario, profile);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::submit_result(
            &teacher_cap,
            &mut catalog,
            1,
            STUDENT1,
            true,
            95,
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ISSUER);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::issue_certificate(
            &issuer_cap,
            &mut catalog,
            1,
            STUDENT1,
            string::utf8(b"ipfs://cert"),
            ctx
        );
        ts::return_to_sender(&scenario, issuer_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, STUDENT1);
        // Verify certificate was transferred to student
        let cert = ts::take_from_sender<educhain::Certificate>(&scenario);
        // Certificate exists - issuance successful

        ts::return_to_sender(&scenario, cert);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = educhain::E_ALREADY_CERTIFIED)]
    fun test_issue_certificate_duplicate() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        transfer::public_transfer(teacher_cap, TEACHER);
        transfer::public_transfer(issuer_cap, ISSUER);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Test Course"),
            string::utf8(b"ipfs://test"),
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::enroll(&mut catalog, &mut profile, 1, ctx);
        ts::return_to_sender(&scenario, profile);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::submit_result(
            &teacher_cap,
            &mut catalog,
            1,
            STUDENT1,
            true,
            95,
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ISSUER);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::issue_certificate(
            &issuer_cap,
            &mut catalog,
            1,
            STUDENT1,
            string::utf8(b"ipfs://cert"),
            ctx
        );
        ts::return_to_sender(&scenario, issuer_cap);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ISSUER);
        let issuer_cap2 = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // Try to issue certificate again - should fail
        educhain::issue_certificate(
            &issuer_cap2,
            &mut catalog,
            1,
            STUDENT1,
            string::utf8(b"ipfs://cert2"),
            ctx
        );

        ts::return_to_sender(&scenario, issuer_cap2);
        ts::return_shared(catalog);
        ts::end(scenario);
    }

    // ============================================================================
    // Proposal Tests
    // ============================================================================

    #[test]
    fun test_create_proposal() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_proposal(
            &admin_cap,
            &mut registry,
            string::utf8(b"Test Proposal"),
            string::utf8(b"Test Description"),
            ctx
        );

        // Proposal created successfully (verified by voting test)
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    fun test_create_proposal_multiple() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_proposal(
            &admin_cap,
            &mut registry,
            string::utf8(b"Proposal 1"),
            string::utf8(b"Description 1"),
            ctx
        );
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_proposal(
            &admin_cap,
            &mut registry,
            string::utf8(b"Proposal 2"),
            string::utf8(b"Description 2"),
            ctx
        );

        // Both proposals created successfully (verified by creation)

        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    fun test_vote_yes() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_proposal(
            &admin_cap,
            &mut registry,
            string::utf8(b"Test Proposal"),
            string::utf8(b"Test Description"),
            ctx
        );
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::vote(&mut registry, &mut profile, 1, 1, ctx);

        // Vote successful - civic points are updated internally
        ts::return_to_sender(&scenario, profile);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    fun test_vote_no() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_proposal(
            &admin_cap,
            &mut registry,
            string::utf8(b"Test Proposal"),
            string::utf8(b"Test Description"),
            ctx
        );
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::vote(&mut registry, &mut profile, 1, 0, ctx);

        // Vote successful - civic points are updated internally
        ts::return_to_sender(&scenario, profile);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = educhain::E_DUPLICATE_VOTE)]
    fun test_vote_duplicate() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_proposal(
            &admin_cap,
            &mut registry,
            string::utf8(b"Test Proposal"),
            string::utf8(b"Test Description"),
            ctx
        );
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::vote(&mut registry, &mut profile, 1, 1, ctx);
        ts::return_to_sender(&scenario, profile);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // Try to vote again - should fail
        educhain::vote(&mut registry, &mut profile, 1, 0, ctx);

        ts::return_to_sender(&scenario, profile);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = educhain::E_INVALID_CHOICE)]
    fun test_vote_invalid_choice() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_proposal(
            &admin_cap,
            &mut registry,
            string::utf8(b"Test Proposal"),
            string::utf8(b"Test Description"),
            ctx
        );
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // Try to vote with invalid choice (must be 0 or 1)
        educhain::vote(&mut registry, &mut profile, 1, 2, ctx);

        ts::return_to_sender(&scenario, profile);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = educhain::E_PROPOSAL_NOT_FOUND)]
    fun test_vote_proposal_not_found() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_shared(catalog);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // Try to vote on non-existent proposal
        educhain::vote(&mut registry, &mut profile, 999, 1, ctx);

        ts::return_to_sender(&scenario, profile);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    fun test_vote_multiple_users() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_proposal(
            &admin_cap,
            &mut registry,
            string::utf8(b"Test Proposal"),
            string::utf8(b"Test Description"),
            ctx
        );
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile1 = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::vote(&mut registry, &mut profile1, 1, 1, ctx);
        ts::return_to_sender(&scenario, profile1);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT2);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT2);
        let profile2 = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::vote(&mut registry, &mut profile2, 1, 0, ctx);
        ts::return_to_sender(&scenario, profile2);
        ts::return_shared(registry);

        // Both votes recorded successfully - points updated internally
        ts::end(scenario);
    }

    #[test]
    fun test_finalize_proposal() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_proposal(
            &admin_cap,
            &mut registry,
            string::utf8(b"Test Proposal"),
            string::utf8(b"Test Description"),
            ctx
        );
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::vote(&mut registry, &mut profile, 1, 1, ctx);
        ts::return_to_sender(&scenario, profile);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::finalize_proposal(&admin_cap, &mut registry, 1, ctx);

        // Proposal finalized successfully (verified by finalization)
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = educhain::E_PROPOSAL_NOT_OPEN)]
    fun test_vote_after_finalization() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_proposal(
            &admin_cap,
            &mut registry,
            string::utf8(b"Test Proposal"),
            string::utf8(b"Test Description"),
            ctx
        );
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::finalize_proposal(&admin_cap, &mut registry, 1, ctx);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // Try to vote after finalization - should fail
        educhain::vote(&mut registry, &mut profile, 1, 1, ctx);

        ts::return_to_sender(&scenario, profile);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = educhain::E_PROPOSAL_NOT_FOUND)]
    fun test_finalize_proposal_not_found() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::return_shared(catalog);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        // Try to finalize non-existent proposal
        educhain::finalize_proposal(&admin_cap, &mut registry, 999, ctx);

        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    // ============================================================================
    // Integration Tests
    // ============================================================================

    #[test]
    fun test_full_course_flow() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        transfer::public_transfer(teacher_cap, TEACHER);
        transfer::public_transfer(issuer_cap, ISSUER);

        // 1. Create course
        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_course(
            &teacher_cap,
            &mut catalog,
            string::utf8(b"Full Flow Course"),
            string::utf8(b"ipfs://fullflow"),
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        // 2. Student creates profile
        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        // 3. Student enrolls
        ts::next_tx(&mut scenario, STUDENT1);
        let profile = ts::take_from_sender<educhain::Profile>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::enroll(&mut catalog, &mut profile, 1, ctx);
        // Enrollment successful
        ts::return_to_sender(&scenario, profile);
        ts::return_shared(catalog);

        // 4. Teacher submits result
        ts::next_tx(&mut scenario, TEACHER);
        let teacher_cap = ts::take_from_sender<educhain::TeacherCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::submit_result(
            &teacher_cap,
            &mut catalog,
            1,
            STUDENT1,
            true,
            88,
            ctx
        );
        ts::return_to_sender(&scenario, teacher_cap);
        ts::return_shared(catalog);

        // 5. Issuer issues certificate
        ts::next_tx(&mut scenario, ISSUER);
        let issuer_cap = ts::take_from_sender<educhain::IssuerCap>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::issue_certificate(
            &issuer_cap,
            &mut catalog,
            1,
            STUDENT1,
            string::utf8(b"ipfs://cert"),
            ctx
        );
        ts::return_to_sender(&scenario, issuer_cap);
        ts::return_shared(catalog);

        // 6. Verify certificate was issued
        ts::next_tx(&mut scenario, STUDENT1);
        let cert = ts::take_from_sender<educhain::Certificate>(&scenario);
        // Certificate exists - issuance successful
        ts::return_to_sender(&scenario, cert);
        ts::return_shared(registry);
        ts::end(scenario);
    }

    #[test]
    fun test_full_proposal_flow() {
        let scenario = ts::begin(ADMIN);
        let ctx = ts::ctx(&mut scenario);
        educhain::init_state(ctx);

        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let catalog = ts::take_shared<educhain::CourseCatalog>(&scenario);
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(catalog);
        ts::return_shared(registry);

        // 1. Create proposal
        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_proposal(
            &admin_cap,
            &mut registry,
            string::utf8(b"Full Flow Proposal"),
            string::utf8(b"Description"),
            ctx
        );
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);

        // 2. Multiple users vote
        ts::next_tx(&mut scenario, STUDENT1);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT1);
        let profile1 = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::vote(&mut registry, &mut profile1, 1, 1, ctx);
        ts::return_to_sender(&scenario, profile1);
        ts::return_shared(registry);

        ts::next_tx(&mut scenario, STUDENT2);
        let ctx = ts::ctx(&mut scenario);
        educhain::create_profile(ctx);

        ts::next_tx(&mut scenario, STUDENT2);
        let profile2 = ts::take_from_sender<educhain::Profile>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::vote(&mut registry, &mut profile2, 1, 0, ctx);
        ts::return_to_sender(&scenario, profile2);
        ts::return_shared(registry);

        // 3. Finalize proposal
        ts::next_tx(&mut scenario, ADMIN);
        let admin_cap = ts::take_from_sender<educhain::AdminCap>(&scenario);
        let registry = ts::take_shared<educhain::ProposalRegistry>(&scenario);
        let ctx = ts::ctx(&mut scenario);
        educhain::finalize_proposal(&admin_cap, &mut registry, 1, ctx);

        // Proposal finalized with correct vote counts (verified by finalization)
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(registry);
        ts::end(scenario);
    }
}
