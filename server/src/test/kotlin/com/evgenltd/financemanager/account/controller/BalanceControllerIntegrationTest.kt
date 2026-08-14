package com.evgenltd.financemanager.account.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.record.BalanceRecalculationRequest
import com.evgenltd.financemanager.account.record.BalanceRecord
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.service.TransactionService
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpStatus
import java.time.LocalDate

class BalanceControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var transactionService: TransactionService

    @BeforeEach
    fun setUp() {
        cleanupTestData()
    }

    @Test
    fun `list - returns all balances`() {
        val bankAccount = withTenant { accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT)) }
        withTenant {
            balanceRepository.save(
                Balance(
                    account = bankAccount,
                    amount = Amount(1_000_000L, "USD"),
                    date = LocalDate.of(2024, 1, 1),
                )
            )
        }

        val response = restClient.get()
            .uri("/api/v1/balance")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<BalanceRecord>>>() {})

        assertThat(response!!.body).extracting("amount").containsExactly(Amount(1_000_000L, "USD"))
    }

    @Test
    fun `recalculate - triggers balance recalculation for the given account and date`() {
        val bankAccount = withTenant { accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT)) }
        val expenseCategory = withTenant { accountRepository.save(Account(name = "Food", type = AccountType.EXPENSE)) }
        withTenant {
            // requestCalculateBalance(accountId, date) only recalculates currencies that already
            // have a balance row (via findCurrencies) - it doesn't create one from scratch.
            balanceRepository.save(Balance(account = bankAccount, amount = Amount(0L, "USD"), date = LocalDate.of(2024, 1, 1)))
            val operation = operationRepository.save(
                Operation(
                    date = LocalDate.of(2024, 1, 15),
                    type = OperationType.EXPENSE,
                    amountFrom = Amount(1_000_000L, "USD"),
                    accountFrom = bankAccount,
                    amountTo = Amount(1_000_000L, "USD"),
                    accountTo = expenseCategory,
                    description = "Groceries",
                )
            )
            transactionService.save(operation)
        }

        val response = restClient.post()
            .uri("/api/v1/balance/recalculate")
            .headers { it.addAll(authHeaders()) }
            .body(BalanceRecalculationRequest(accountId = bankAccount.id!!, date = LocalDate.of(2024, 1, 15)))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")
            assertThat(balance).isNotNull
            assertThat(balance!!.amount.value).isEqualTo(-1_000_000L)
        }
    }
}
