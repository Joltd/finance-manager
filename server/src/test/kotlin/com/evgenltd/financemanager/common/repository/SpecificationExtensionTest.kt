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
    fun `amountBetween - matches a human-scale BigDecimal range against the scale-4 stored value`() {
        // 100.0000 USD is stored as the raw Long 1000000 (Amount.SCALE = 4).
        val hundredDollarOperation = operationRepository.save(
            expenseOperation(LocalDate.of(2024, 1, 15), valueUsd = 1_000_000L)
        )

        // A caller passing a human-scale range (e.g. "50.00" to "150.00", as a UI amount filter would)
        // matches, because amountBetween now scales the BigDecimal via Amount.toAmountValue() before
        // comparing it against the raw scale-4 Long column.
        val matchingResult = operationRepository.findAll(
            Operation::amountFrom amountBetween BigDecimalRange(BigDecimal("50"), BigDecimal("150"))
        )
        assertThat(matchingResult).extracting("id").containsExactly(hundredDollarOperation.id)

        // A range that doesn't cover 100 in human-scale terms does not match.
        val nonMatchingResult = operationRepository.findAll(
            Operation::amountFrom amountBetween BigDecimalRange(BigDecimal("200"), BigDecimal("300"))
        )
        assertThat(nonMatchingResult).isEmpty()
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
