package com.evgenltd.financemanager

import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.account.repository.TurnoverRepository
import com.evgenltd.financemanager.config.TestAsyncConfig
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.user.component.withTenant
import com.evgenltd.financemanager.user.entity.UserRole
import com.evgenltd.financemanager.user.service.TokenProvider
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.context.annotation.Import
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatusCode
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.web.client.RestClient
import java.util.UUID

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(TestAsyncConfig::class)
abstract class AbstractIntegrationTest {

    @LocalServerPort
    private var port: Int = 0

    protected val restClient: RestClient by lazy {
        RestClient.builder()
            .baseUrl("http://localhost:$port")
            .defaultStatusHandler(HttpStatusCode::isError) { _, _ -> }
            .build()
    }

    @Autowired
    protected lateinit var tokenProvider: TokenProvider

    @Autowired
    protected lateinit var accountRepository: AccountRepository

    @Autowired
    protected lateinit var balanceRepository: BalanceRepository

    @Autowired
    protected lateinit var turnoverRepository: TurnoverRepository

    @Autowired
    protected lateinit var operationRepository: OperationRepository

    @Autowired
    protected lateinit var transactionRepository: TransactionRepository

    companion object {
        val TEST_TENANT: UUID = UUID.fromString("00000000-0000-0000-0000-000000000001")
        val TEST_USER_ID: UUID = UUID.fromString("00000000-0000-0000-0000-000000000002")
    }

    protected fun authHeaders(): HttpHeaders = HttpHeaders().apply {
        setBearerAuth(tokenProvider.createAccessToken(TEST_USER_ID, "test-user", UserRole.USER, TEST_TENANT))
        contentType = MediaType.APPLICATION_JSON
    }

    protected fun <T> withTenant(block: () -> T): T = withTenant(TEST_TENANT, block)

    protected fun cleanupTestData() {
        withTenant {
            operationRepository.deleteAll()
            turnoverRepository.deleteAll()
            balanceRepository.deleteAll()
            accountRepository.deleteAll()
        }
    }
}