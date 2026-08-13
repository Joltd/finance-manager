package com.evgenltd.financemanager.testsupport

import com.evgenltd.financemanager.config.TestAsyncConfig
import com.evgenltd.financemanager.user.component.tenantContext
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Base class for tests that call repositories/services directly on the test thread
 * (as opposed to [com.evgenltd.financemanager.AbstractIntegrationTest], which goes
 * through a real HTTP round trip on a server-managed thread/transaction).
 *
 * Because the call happens on the test thread, `@Transactional` rolls the transaction
 * back after each test - no manual cleanup is required. The tenant `ThreadLocal` is
 * set/cleared automatically so every test runs under [TEST_TENANT] by construction,
 * instead of silently falling back to the zero-UUID tenant.
 */
@SpringBootTest
@ActiveProfiles("test")
@Import(TestAsyncConfig::class)
@Transactional
abstract class AbstractRepositoryTest {

    companion object {
        val TEST_TENANT: UUID = UUID.fromString("00000000-0000-0000-0000-000000000001")
    }

    @BeforeEach
    fun setUpTenantContext() {
        tenantContext.set(TEST_TENANT)
    }

    @AfterEach
    fun tearDownTenantContext() {
        tenantContext.set(null)
    }
}
