package com.evgenltd.financemanager.user.component

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.service.BalanceProcessService
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.service.TransactionService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDate

/**
 * The only test in the suite that runs with the real @Async executor active (every other
 * test relies on AsyncConfiguration's `@Profile("!test | async")` guard keeping @Async a
 * synchronous no-op for deterministic assertions). Activating "async" here - merged with the
 * inherited "test" profile via ActiveProfiles' default inheritProfiles=true - gives this class
 * its own separate, uncached Spring context, so it cannot affect any other test's behavior.
 *
 * Verifies that ContextPropagatingTaskDecorator carries the tenant ThreadLocal across the
 * real async thread boundary: BalanceProcessService.requestCalculateBalance(event) is
 * @Async, so if propagation were broken, the recalculation would silently run under
 * NULL_TENANT, never find the balance row, and never complete.
 */
@ActiveProfiles("async")
class AsyncTenantPropagationIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var transactionService: TransactionService

    @Autowired
    private lateinit var balanceProcessService: BalanceProcessService

    @BeforeEach
    fun setUp() {
        cleanupTestData()
    }

    @Test
    fun `requestCalculateBalance - tenant context propagates into the real async executor thread`() {
        val bankAccount = withTenant {
            val bankAccount = accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT))
            val expenseCategory = accountRepository.save(Account(name = "Food", type = AccountType.EXPENSE))
            val operation = operationRepository.save(
                Operation(
                    date = LocalDate.of(2024, 1, 15),
                    type = OperationType.EXPENSE,
                    amountFrom = Amount(1_000_000L, "USD"), // 100.0000 USD
                    accountFrom = bankAccount,
                    amountTo = Amount(1_000_000L, "USD"),
                    accountTo = expenseCategory,
                    description = "Groceries",
                )
            )
            transactionService.save(operation)
            bankAccount
        }

        withTenant { balanceProcessService.requestCalculateBalance(bankAccount.id!!, "USD", LocalDate.of(2024, 1, 15)) }

        // The recalculation now genuinely happens on a background thread, so poll instead of
        // asserting immediately - unlike every other test in the suite, which can assert right away.
        val recalculated = awaitUntil(timeoutMs = 5000) {
            withTenant { balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")?.calculationDate == null }
        }
        assertThat(recalculated)
            .describedAs("balance recalculation should complete asynchronously if the tenant context propagated correctly")
            .isTrue()

        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")
            assertThat(balance).isNotNull
            assertThat(balance!!.amount.value).isEqualTo(-1_000_000L)
        }
    }

    private fun awaitUntil(timeoutMs: Long, check: () -> Boolean): Boolean {
        val deadline = System.currentTimeMillis() + timeoutMs
        while (System.currentTimeMillis() < deadline) {
            if (check()) return true
            Thread.sleep(100)
        }
        return check()
    }
}
