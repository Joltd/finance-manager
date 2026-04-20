package com.evgenltd.financemanager.operation.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.OperationRecord
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.time.LocalDate
import java.time.Month
import java.util.UUID


class OperationControllerIntegrationTest : AbstractIntegrationTest() {

    private lateinit var bankAccount: Account
    private lateinit var expenseCategory: Account
    private lateinit var incomeCategory: Account
    private lateinit var savingsAccount: Account

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        withTenant {
            bankAccount = accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT))
            expenseCategory = accountRepository.save(Account(name = "Food", type = AccountType.EXPENSE))
            incomeCategory = accountRepository.save(Account(name = "Salary", type = AccountType.INCOME))
            savingsAccount = accountRepository.save(Account(name = "Savings", type = AccountType.ACCOUNT))
        }
    }

    @Test
    fun `create expense operation - bank balance decreases and turnover is recorded`() {
        val date = LocalDate.of(2024, 1, 15)
        val amount = Amount(1000000L, "USD") // 100.0000 USD

        val response = postOperation(
            OperationRecord(
                id = null,
                date = date,
                type = OperationType.EXPENSE,
                amountFrom = amount,
                accountFrom = accountRecordOf(bankAccount),
                amountTo = amount,
                accountTo = accountRecordOf(expenseCategory),
                description = "Groceries",
            )
        )
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)

        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")
            assertThat(balance).isNotNull
            assertThat(balance!!.amount.value).isEqualTo(-1000000L)
            assertThat(balance.amount.currency).isEqualTo("USD")

            val turnovers = turnoverRepository.findByAccount(bankAccount)
            assertThat(turnovers).hasSize(1)
            assertThat(turnovers[0].amount.value).isEqualTo(-1000000L)
            assertThat(turnovers[0].cumulativeAmount.value).isEqualTo(-1000000L)
            assertThat(turnovers[0].date).isEqualTo(LocalDate.of(2024, 1, 1))
        }
    }

    @Test
    fun `create income operation - bank balance increases and turnover is recorded`() {
        val date = LocalDate.of(2024, 2, 10)
        val amount = Amount(2000000L, "USD") // 200.0000 USD

        postOperation(
            OperationRecord(
                id = null,
                date = date,
                type = OperationType.INCOME,
                amountFrom = amount,
                accountFrom = accountRecordOf(incomeCategory),
                amountTo = amount,
                accountTo = accountRecordOf(bankAccount),
                description = "Monthly salary",
            )
        )

        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")
            assertThat(balance).isNotNull
            assertThat(balance!!.amount.value).isEqualTo(2000000L)

            val turnovers = turnoverRepository.findByAccount(bankAccount)
            assertThat(turnovers).hasSize(1)
            assertThat(turnovers[0].amount.value).isEqualTo(2000000L)
            assertThat(turnovers[0].cumulativeAmount.value).isEqualTo(2000000L)
            assertThat(turnovers[0].date).isEqualTo(LocalDate.of(2024, 2, 1))
        }
    }

    @Test
    fun `create transfer operation - both account balances are updated`() {
        val date = LocalDate.of(2024, 3, 5)
        val amount = Amount(500000L, "USD") // 50.0000 USD

        postOperation(
            OperationRecord(
                id = null,
                date = date,
                type = OperationType.TRANSFER,
                amountFrom = amount,
                accountFrom = accountRecordOf(bankAccount),
                amountTo = amount,
                accountTo = accountRecordOf(savingsAccount),
                description = "Transfer to savings",
            )
        )

        withTenant {
            val bankBalance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")
            assertThat(bankBalance).isNotNull
            assertThat(bankBalance!!.amount.value).isEqualTo(-500000L)

            val savingsBalance = balanceRepository.findByAccountAndAmountCurrency(savingsAccount, "USD")
            assertThat(savingsBalance).isNotNull
            assertThat(savingsBalance!!.amount.value).isEqualTo(500000L)

            val bankTurnovers = turnoverRepository.findByAccount(bankAccount)
            assertThat(bankTurnovers).hasSize(1)
            assertThat(bankTurnovers[0].amount.value).isEqualTo(-500000L)
            assertThat(bankTurnovers[0].cumulativeAmount.value).isEqualTo(-500000L)

            val savingsTurnovers = turnoverRepository.findByAccount(savingsAccount)
            assertThat(savingsTurnovers).hasSize(1)
            assertThat(savingsTurnovers[0].amount.value).isEqualTo(500000L)
            assertThat(savingsTurnovers[0].cumulativeAmount.value).isEqualTo(500000L)
        }
    }

    @Test
    fun `update operation - balance and turnover reflect updated amount`() {
        val date = LocalDate.of(2024, 1, 15)
        val initialAmount = Amount(1000000L, "USD") // 100.0000 USD
        val updatedAmount = Amount(1500000L, "USD") // 150.0000 USD

        postOperation(
            OperationRecord(
                id = null,
                date = date,
                type = OperationType.EXPENSE,
                amountFrom = initialAmount,
                accountFrom = accountRecordOf(bankAccount),
                amountTo = initialAmount,
                accountTo = accountRecordOf(expenseCategory),
                description = "Initial amount",
            )
        )

        val operationId: UUID = withTenant { operationRepository.findAll().first().id!! }

        postOperation(
            OperationRecord(
                id = operationId,
                date = date,
                type = OperationType.EXPENSE,
                amountFrom = updatedAmount,
                accountFrom = accountRecordOf(bankAccount),
                amountTo = updatedAmount,
                accountTo = accountRecordOf(expenseCategory),
                description = "Updated amount",
            )
        )

        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")
            assertThat(balance).isNotNull
            assertThat(balance!!.amount.value).isEqualTo(-1500000L)

            val turnovers = turnoverRepository.findByAccount(bankAccount)
            assertThat(turnovers).hasSize(1)
            assertThat(turnovers[0].amount.value).isEqualTo(-1500000L)
            assertThat(turnovers[0].cumulativeAmount.value).isEqualTo(-1500000L)
        }
    }

    @Test
    fun `delete operation - balance resets to zero and turnovers are cleared`() {
        val date = LocalDate.of(2024, 1, 15)
        val amount = Amount(1000000L, "USD") // 100.0000 USD

        postOperation(
            OperationRecord(
                id = null,
                date = date,
                type = OperationType.EXPENSE,
                amountFrom = amount,
                accountFrom = accountRecordOf(bankAccount),
                amountTo = amount,
                accountTo = accountRecordOf(expenseCategory),
                description = "To be deleted",
            )
        )

        val operationId: UUID = withTenant { operationRepository.findAll().first().id!! }

        deleteOperation(operationId)

        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")
            assertThat(balance).isNotNull
            assertThat(balance!!.amount.value).isEqualTo(0L)

            val turnovers = turnoverRepository.findByAccount(bankAccount)
            assertThat(turnovers).isEmpty()
        }
    }

    @Test
    fun `multiple expenses in the same month - turnover aggregates all transactions`() {
        // 100 + 50 + 200 = 350 USD total expense in January
        postOperation(expenseRecord(date = LocalDate.of(2024, 1, 15), valueUsd = 1000000L, description = "Groceries"))
        postOperation(expenseRecord(date = LocalDate.of(2024, 1, 20), valueUsd = 500000L, description = "Transport"))
        postOperation(expenseRecord(date = LocalDate.of(2024, 1, 25), valueUsd = 2000000L, description = "Rent"))

        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")!!
            assertThat(balance.amount.value).isEqualTo(-3500000L)

            val turnovers = turnoverRepository.findByAccount(bankAccount).sortedBy { it.date }
            assertThat(turnovers).hasSize(1)
            assertThat(turnovers[0].date).isEqualTo(LocalDate.of(2024, 1, 1))
            assertThat(turnovers[0].amount.value).isEqualTo(-3500000L)
            assertThat(turnovers[0].cumulativeAmount.value).isEqualTo(-3500000L)
        }
    }

    @Test
    fun `operations across multiple months - turnovers reflect monthly amounts and running total`() {
        // Jan: +1000, Feb: -200, Mar: -150 → cumulative: +1000, +800, +650
        postOperation(incomeRecord(date = LocalDate.of(2024, 1, 15), valueUsd = 10000000L))  // +1000
        postOperation(expenseRecord(date = LocalDate.of(2024, 2, 10), valueUsd = 2000000L))  // -200
        postOperation(expenseRecord(date = LocalDate.of(2024, 3, 5), valueUsd = 1500000L))   // -150

        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")!!
            assertThat(balance.amount.value).isEqualTo(6500000L) // +650

            val turnovers = turnoverRepository.findByAccount(bankAccount).sortedBy { it.date }
            assertThat(turnovers).hasSize(3)

            assertThat(turnovers[0].date).isEqualTo(LocalDate.of(2024, 1, 1))
            assertThat(turnovers[0].amount.value).isEqualTo(10000000L)       // +1000
            assertThat(turnovers[0].cumulativeAmount.value).isEqualTo(10000000L) // +1000

            assertThat(turnovers[1].date).isEqualTo(LocalDate.of(2024, 2, 1))
            assertThat(turnovers[1].amount.value).isEqualTo(-2000000L)       // -200
            assertThat(turnovers[1].cumulativeAmount.value).isEqualTo(8000000L)  // +800

            assertThat(turnovers[2].date).isEqualTo(LocalDate.of(2024, 3, 1))
            assertThat(turnovers[2].amount.value).isEqualTo(-1500000L)       // -150
            assertThat(turnovers[2].cumulativeAmount.value).isEqualTo(6500000L)  // +650
        }
    }

    @Test
    fun `update operation in past month - all subsequent turnovers and balance are recalculated`() {
        // Create income in Jan and expense in Feb
        postOperation(incomeRecord(date = LocalDate.of(2024, 1, 15), valueUsd = 10000000L)) // +1000
        postOperation(expenseRecord(date = LocalDate.of(2024, 2, 10), valueUsd = 2000000L)) // -200

        // Update Jan income from 1000 to 500
        val janOperationId: UUID = withTenant {
            operationRepository.findAll().first { it.date.month == Month.JANUARY }.id!!
        }
        postOperation(incomeRecord(id = janOperationId, date = LocalDate.of(2024, 1, 15), valueUsd = 5000000L)) // +500

        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")!!
            assertThat(balance.amount.value).isEqualTo(3000000L) // +300

            val turnovers = turnoverRepository.findByAccount(bankAccount).sortedBy { it.date }
            assertThat(turnovers).hasSize(2)

            assertThat(turnovers[0].date).isEqualTo(LocalDate.of(2024, 1, 1))
            assertThat(turnovers[0].amount.value).isEqualTo(5000000L)       // +500
            assertThat(turnovers[0].cumulativeAmount.value).isEqualTo(5000000L) // +500

            assertThat(turnovers[1].date).isEqualTo(LocalDate.of(2024, 2, 1))
            assertThat(turnovers[1].amount.value).isEqualTo(-2000000L)       // -200
            assertThat(turnovers[1].cumulativeAmount.value).isEqualTo(3000000L)  // +300
        }
    }

    @Test
    fun `delete one of multiple operations - remaining operations determine balance and turnovers`() {
        postOperation(expenseRecord(date = LocalDate.of(2024, 1, 15), valueUsd = 1000000L)) // -100
        postOperation(expenseRecord(date = LocalDate.of(2024, 1, 20), valueUsd = 500000L))  // -50

        val operationToDelete: UUID = withTenant {
            operationRepository.findAll().first { it.date == LocalDate.of(2024, 1, 15) }.id!!
        }
        deleteOperation(operationToDelete)

        withTenant {
            val balance = balanceRepository.findByAccountAndAmountCurrency(bankAccount, "USD")!!
            assertThat(balance.amount.value).isEqualTo(-500000L) // only -50 remains

            val turnovers = turnoverRepository.findByAccount(bankAccount)
            assertThat(turnovers).hasSize(1)
            assertThat(turnovers[0].amount.value).isEqualTo(-500000L)
            assertThat(turnovers[0].cumulativeAmount.value).isEqualTo(-500000L)
        }
    }

    // --- helpers ---

    private fun expenseRecord(
        id: UUID? = null,
        date: LocalDate,
        valueUsd: Long,
        description: String = "",
    ) = OperationRecord(
        id = id,
        date = date,
        type = OperationType.EXPENSE,
        amountFrom = Amount(valueUsd, "USD"),
        accountFrom = accountRecordOf(bankAccount),
        amountTo = Amount(valueUsd, "USD"),
        accountTo = accountRecordOf(expenseCategory),
        description = description,
    )

    private fun incomeRecord(
        id: UUID? = null,
        date: LocalDate,
        valueUsd: Long,
    ) = OperationRecord(
        id = id,
        date = date,
        type = OperationType.INCOME,
        amountFrom = Amount(valueUsd, "USD"),
        accountFrom = accountRecordOf(incomeCategory),
        amountTo = Amount(valueUsd, "USD"),
        accountTo = accountRecordOf(bankAccount),
        description = "",
    )

    // --- helpers ---

    private fun postOperation(record: OperationRecord): ResponseEntity<String> =
        restClient.post()
            .uri("/api/v1/operation")
            .headers { it.addAll(authHeaders()) }
            .body(record)
            .retrieve()
            .toEntity(String::class.java)

    private fun deleteOperation(id: UUID): ResponseEntity<String> =
        restClient.delete()
            .uri("/api/v1/operation/$id")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

    private fun accountRecordOf(account: Account) = AccountRecord(
        id = account.id,
        name = account.name,
        type = account.type,
        parser = null,
        deleted = false,
        reviseDate = null,
    )
}