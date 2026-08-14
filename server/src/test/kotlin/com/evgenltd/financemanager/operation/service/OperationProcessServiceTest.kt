package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate

/**
 * Covers the bulk save/delete paths of OperationProcessService (used by the import flow),
 * which OperationControllerIntegrationTest does not exercise - that test only goes through
 * the single-operation create/update/delete HTTP endpoints.
 *
 * Extends AbstractIntegrationTest (not the transactional AbstractRepositoryTest) because
 * OperationProcessService is itself @Transactional(propagation = Propagation.NEVER) in
 * production - an ambient test transaction would conflict with that, the same reason
 * BalanceProcessServiceTest avoids it.
 */
class OperationProcessServiceTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var operationProcessService: OperationProcessService

    private lateinit var bankAccount: Account
    private lateinit var expenseCategory: Account

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        withTenant {
            bankAccount = accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT))
            expenseCategory = accountRepository.save(Account(name = "Food", type = AccountType.EXPENSE))
        }
    }

    @Test
    fun `save - bulk creates operations, transactions and recalculates the resulting balance`() {
        val ids = withTenant {
            operationProcessService.save(
                listOf(
                    expenseOperation(LocalDate.of(2024, 1, 10), 1_000_000L), // -100
                    expenseOperation(LocalDate.of(2024, 1, 20), 500_000L),   // -50
                )
            )
        }
        assertThat(ids).hasSize(2)

        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")
            assertThat(balance).isNotNull
            assertThat(balance!!.amount.value).isEqualTo(-1_500_000L)

            assertThat(transactionRepository.findAll()).hasSize(4) // 2 operations x (OUT + IN)
        }
    }

    @Test
    fun `delete by ids - bulk removes operations and recalculates the resulting balance`() {
        val ids = withTenant {
            operationProcessService.save(
                listOf(
                    expenseOperation(LocalDate.of(2024, 1, 10), 1_000_000L), // -100
                    expenseOperation(LocalDate.of(2024, 1, 20), 500_000L),   // -50
                )
            )
        }

        withTenant { operationProcessService.delete(ids) }

        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")
            assertThat(balance).isNotNull
            assertThat(balance!!.amount.value).isEqualTo(0L)
            assertThat(operationRepository.findAll()).isEmpty()
            assertThat(transactionRepository.findAll()).isEmpty()
        }
    }

    private fun expenseOperation(date: LocalDate, valueUsd: Long) = Operation(
        date = date,
        type = OperationType.EXPENSE,
        amountFrom = Amount(valueUsd, "USD"),
        accountFrom = bankAccount,
        amountTo = Amount(valueUsd, "USD"),
        accountTo = expenseCategory,
        description = "",
    )
}
