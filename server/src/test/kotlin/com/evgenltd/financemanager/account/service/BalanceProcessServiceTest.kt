package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.service.TransactionService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate

/**
 * Exercises BalanceProcessService directly (bypassing HTTP), through its real
 * calculationRequest -> event -> lock -> recalculation pipeline - the same pipeline
 * OperationControllerIntegrationTest triggers indirectly by creating operations.
 *
 * Extends AbstractIntegrationTest (not the transactional AbstractRepositoryTest) because
 * a successful recalculation publishes BalanceCalculationCompleted, which
 * ImportDataProcessService listens to under @Transactional(propagation = Propagation.NEVER) -
 * that fails if this test also wraps the call in an ambient transaction.
 */
class BalanceProcessServiceTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var transactionService: TransactionService

    @Autowired
    private lateinit var balanceProcessService: BalanceProcessService

    @BeforeEach
    fun setUp() {
        cleanupTestData()
    }

    @Test
    fun `requestCalculateBalance - recalculates the balance from transactions and clears the pending calculation flag`() {
        withTenant {
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

            balanceProcessService.requestCalculateBalance(bankAccount.id!!, "USD", LocalDate.of(2024, 1, 15))

            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")
            assertThat(balance).isNotNull
            assertThat(balance!!.amount.value).isEqualTo(-1_000_000L)
            assertThat(balance.calculationDate).isNull()
            assertThat(balance.calculationVersion).isNull()
        }
    }

    @Test
    fun `requestCalculateBalance by date - recalculates every currency the account currently has a balance in`() {
        withTenant {
            val bankAccount = accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT))
            val expenseCategory = accountRepository.save(Account(name = "Food", type = AccountType.EXPENSE))
            balanceRepository.save(
                Balance(
                    account = bankAccount,
                    amount = Amount(0L, "USD"),
                    date = LocalDate.of(2024, 1, 1),
                )
            )
            val operation = operationRepository.save(
                Operation(
                    date = LocalDate.of(2024, 1, 20),
                    type = OperationType.EXPENSE,
                    amountFrom = Amount(250_000L, "USD"), // 25.0000 USD
                    accountFrom = bankAccount,
                    amountTo = Amount(250_000L, "USD"),
                    accountTo = expenseCategory,
                    description = "Coffee",
                )
            )
            transactionService.save(operation)

            balanceProcessService.requestCalculateBalance(bankAccount.id!!, LocalDate.of(2024, 1, 20))

            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")
            assertThat(balance).isNotNull
            assertThat(balance!!.amount.value).isEqualTo(-250_000L)
        }
    }
}
