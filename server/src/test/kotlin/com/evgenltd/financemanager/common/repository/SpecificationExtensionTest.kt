package com.evgenltd.financemanager.common.repository

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.common.record.BigDecimalRange
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.testsupport.AbstractRepositoryTest
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.math.BigDecimal
import java.time.LocalDate

/**
 * These tests execute the Specification DSL against real persisted rows (not mocked
 * `Specification` lambdas), since a `Specification` is just a closure - asserting that
 * one was constructed proves nothing about the SQL it produces.
 */
class SpecificationExtensionTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var accountRepository: AccountRepository

    @Autowired
    private lateinit var operationRepository: OperationRepository

    private lateinit var bankAccount: Account
    private lateinit var expenseCategory: Account
    private lateinit var incomeCategory: Account

    @BeforeEach
    fun setUp() {
        bankAccount = accountRepository.save(Account(name = "Main bank", type = AccountType.ACCOUNT))
        expenseCategory = accountRepository.save(Account(name = "Food", type = AccountType.EXPENSE))
        incomeCategory = accountRepository.save(Account(name = "Salary", type = AccountType.INCOME))
    }

    @Test
    fun `eq - matches only accounts with the given value`() {
        val result = accountRepository.findAll(Account::type eq AccountType.EXPENSE)

        assertThat(result).extracting("id").containsExactly(expenseCategory.id)
    }

    @Test
    fun `eq - null value matches everything (no filter applied)`() {
        val result = accountRepository.findAll(Account::type eq null)

        assertThat(result).hasSize(3)
    }

    @Test
    fun `like - matches case-insensitively on a substring`() {
        val result = accountRepository.findAll(Account::name like "bank")

        assertThat(result).extracting("id").containsExactly(bankAccount.id)
    }

    @Test
    fun `between - matches operations within a half-open date range`() {
        val januaryOperation = operationRepository.save(expenseOperation(LocalDate.of(2024, 1, 15)))
        operationRepository.save(expenseOperation(LocalDate.of(2024, 2, 1))) // outside range (exclusive upper bound)
        operationRepository.save(expenseOperation(LocalDate.of(2023, 12, 31))) // outside range

        val result = operationRepository.findAll(
            Operation::date between Range(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 2, 1))
        )

        assertThat(result).extracting("id").containsExactly(januaryOperation.id)
    }

    @Test
    fun `contains - matches operations on any of the given dates`() {
        val first = operationRepository.save(expenseOperation(LocalDate.of(2024, 1, 10)))
        operationRepository.save(expenseOperation(LocalDate.of(2024, 1, 11))) // not in the list
        val third = operationRepository.save(expenseOperation(LocalDate.of(2024, 1, 12)))

        val result = operationRepository.findAll(
            Operation::date contains listOf(LocalDate.of(2024, 1, 10), LocalDate.of(2024, 1, 12))
        )

        assertThat(result).extracting("id").containsExactlyInAnyOrder(first.id, third.id)
    }

    @Test
    fun `currency - matches operations whose amountFrom currency equals the given value`() {
        val usdOperation = operationRepository.save(expenseOperation(LocalDate.of(2024, 1, 15), currency = "USD"))
        operationRepository.save(expenseOperation(LocalDate.of(2024, 1, 16), currency = "EUR"))

        val result = operationRepository.findAll(Operation::amountFrom currency "USD")

        assertThat(result).extracting("id").containsExactly(usdOperation.id)
    }

    @Test
    fun `amountBetween - compares against the raw scale-4 stored value, not a human-scale BigDecimal`() {
        // 100.0000 USD is stored as the raw Long 1000000 (Amount.SCALE = 4).
        val hundredDollarOperation = operationRepository.save(
            expenseOperation(LocalDate.of(2024, 1, 15), valueUsd = 1_000_000L)
        )

        // A caller passing a human-scale range (e.g. "50.00" to "150.00", as a UI amount filter would)
        // does NOT match, because amountBetween compares that BigDecimal directly against the raw
        // scale-4 Long column (1,000,000) instead of scaling it first via Amount.toAmountValue().
        val humanScaleResult = operationRepository.findAll(
            Operation::amountFrom amountBetween BigDecimalRange(BigDecimal("50"), BigDecimal("150"))
        )
        assertThat(humanScaleResult).isEmpty()

        // Only a range expressed in the same raw scale-4 units actually matches.
        val rawScaleResult = operationRepository.findAll(
            Operation::amountFrom amountBetween BigDecimalRange(BigDecimal("500000"), BigDecimal("1500000"))
        )
        assertThat(rawScaleResult).extracting("id").containsExactly(hundredDollarOperation.id)
    }

    private fun expenseOperation(date: LocalDate, valueUsd: Long = 1_000_000L, currency: String = "USD") = Operation(
        date = date,
        type = OperationType.EXPENSE,
        amountFrom = Amount(valueUsd, currency),
        accountFrom = bankAccount,
        amountTo = Amount(valueUsd, currency),
        accountTo = expenseCategory,
        description = "",
    )
}
