package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.record.AccountBalanceFilter
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.common.util.Amount
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

class AccountServiceTest {

    private val accountRepository = mock<AccountRepository>()
    private val balanceRepository = mock<BalanceRepository>()
    private val accountConverter = AccountConverter(accountRepository)
    private val service = AccountService(accountRepository, accountConverter, AccountEventService(), balanceRepository)

    @Test
    fun `list - maps every returned account to a record`() {
        val account = Account(id = UUID.randomUUID(), name = "Bank", type = AccountType.ACCOUNT)
        whenever(accountRepository.findAll(any<Specification<Account>>(), any<Sort>())).thenReturn(listOf(account))

        val result = service.list(AccountType.ACCOUNT)

        assertThat(result).extracting("id").containsExactly(account.id)
    }

    @Test
    fun `byId - looks up and converts the account`() {
        val id = UUID.randomUUID()
        val account = Account(id = id, name = "Bank", type = AccountType.ACCOUNT)
        whenever(accountRepository.findById(id)).thenReturn(Optional.of(account))

        assertThat(service.byId(id).name).isEqualTo("Bank")
    }

    @Test
    fun `byIdOrNull - returns null when the account does not exist`() {
        val id = UUID.randomUUID()
        whenever(accountRepository.findById(id)).thenReturn(Optional.empty())

        assertThat(service.byIdOrNull(id)).isNull()
    }

    @Test
    fun `update - creates a new account when the record has no id`() {
        val record = AccountRecord(id = null, name = "Food", type = AccountType.EXPENSE, parser = null, deleted = false, reviseDate = null)
        whenever(accountRepository.save(any<Account>())).thenAnswer { it.arguments[0] as Account }

        val result = service.update(record)

        assertThat(result.name).isEqualTo("Food")
        assertThat(result.type).isEqualTo(AccountType.EXPENSE)
    }

    @Test
    fun `update - updates an existing account in place`() {
        val id = UUID.randomUUID()
        val existing = Account(id = id, name = "Old", type = AccountType.ACCOUNT)
        whenever(accountRepository.findById(id)).thenReturn(Optional.of(existing))
        whenever(accountRepository.save(any<Account>())).thenAnswer { it.arguments[0] as Account }

        val record = AccountRecord(id = id, name = "New", type = AccountType.ACCOUNT, parser = null, deleted = false, reviseDate = LocalDate.of(2024, 1, 1))
        val result = service.update(record)

        assertThat(result.name).isEqualTo("New")
        assertThat(result.reviseDate).isEqualTo(LocalDate.of(2024, 1, 1))
    }

    @Test
    fun `delete - hard deletes when the repository allows it`() {
        val id = UUID.randomUUID()
        val account = Account(id = id, name = "Bank", type = AccountType.ACCOUNT)
        whenever(accountRepository.findById(id)).thenReturn(Optional.of(account))

        service.delete(id)

        verify(accountRepository).delete(account)
        verify(accountRepository, never()).save(any<Account>())
    }

    @Test
    fun `delete - falls back to a soft delete when the hard delete fails`() {
        val id = UUID.randomUUID()
        val account = Account(id = id, name = "Bank", type = AccountType.ACCOUNT)
        whenever(accountRepository.findById(id)).thenReturn(Optional.of(account))
        whenever(accountRepository.delete(account)).thenThrow(RuntimeException("referenced by operations"))
        whenever(accountRepository.save(account)).thenReturn(account)

        service.delete(id)

        assertThat(account.deleted).isTrue()
        verify(accountRepository).save(account)
    }

    @Test
    fun `listBalances - groups non-zero balances by account and can hide accounts with none`() {
        val withBalance = Account(id = UUID.randomUUID(), name = "Bank", type = AccountType.ACCOUNT)
        val withoutBalance = Account(id = UUID.randomUUID(), name = "Empty", type = AccountType.ACCOUNT)
        whenever(balanceRepository.findAll()).thenReturn(
            listOf(
                Balance(account = withBalance, amount = Amount(1000000L, "USD"), date = LocalDate.of(2024, 1, 1)),
                Balance(account = withBalance, amount = Amount(0L, "EUR"), date = LocalDate.of(2024, 1, 1)), // zero, filtered out
            )
        )
        whenever(accountRepository.findAll(any<Specification<Account>>(), any<Sort>())).thenReturn(listOf(withBalance, withoutBalance))

        val visibleWithZero = service.listBalances(AccountBalanceFilter(hideZeroBalances = false))
        assertThat(visibleWithZero).hasSize(2)
        assertThat(visibleWithZero.first { it.account.id == withBalance.id }.balances).containsExactly(Amount(1000000L, "USD"))
        assertThat(visibleWithZero.first { it.account.id == withoutBalance.id }.balances).isEmpty()

        val hidingZero = service.listBalances(AccountBalanceFilter(hideZeroBalances = true))
        assertThat(hidingZero).extracting("account.id").containsExactly(withBalance.id)
    }
}
