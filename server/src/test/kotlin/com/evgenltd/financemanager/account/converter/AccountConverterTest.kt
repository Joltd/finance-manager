package com.evgenltd.financemanager.account.converter

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.account.repository.AccountRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

class AccountConverterTest {

    private val accountRepository = mock<AccountRepository>()
    private val converter = AccountConverter(accountRepository)

    @Test
    fun `toRecord - maps entity fields to record`() {
        val entity = Account(
            id = UUID.randomUUID(),
            name = "Bank",
            type = AccountType.ACCOUNT,
            deleted = false,
            reviseDate = LocalDate.of(2024, 1, 1),
            parser = "tinkoff",
            externalId = "ext-1",
        )

        val record = converter.toRecord(entity)

        assertThat(record.id).isEqualTo(entity.id)
        assertThat(record.name).isEqualTo("Bank")
        assertThat(record.type).isEqualTo(AccountType.ACCOUNT)
        assertThat(record.parser).isEqualTo("tinkoff")
        assertThat(record.deleted).isFalse()
        assertThat(record.reviseDate).isEqualTo(LocalDate.of(2024, 1, 1))
        assertThat(record.externalId).isEqualTo("ext-1")
    }

    @Test
    fun `toRecord by id - looks up entity in the repository`() {
        val id = UUID.randomUUID()
        val entity = Account(id = id, name = "Bank", type = AccountType.ACCOUNT)
        whenever(accountRepository.findById(id)).thenReturn(Optional.of(entity))

        val record = converter.toRecord(id)

        assertThat(record.id).isEqualTo(id)
        assertThat(record.name).isEqualTo("Bank")
    }

    @Test
    fun `toReference - maps id, name and deleted flag`() {
        val entity = Account(id = UUID.randomUUID(), name = "Food", type = AccountType.EXPENSE, deleted = true)

        val reference = converter.toReference(entity)

        assertThat(reference.id).isEqualTo(entity.id)
        assertThat(reference.name).isEqualTo("Food")
        assertThat(reference.deleted).isTrue()
    }

    @Test
    fun `toAccountReference - maps id, name, deleted, type and reviseDate`() {
        val entity = Account(
            id = UUID.randomUUID(),
            name = "Salary",
            type = AccountType.INCOME,
            reviseDate = LocalDate.of(2024, 2, 1),
        )

        val reference = converter.toAccountReference(entity)

        assertThat(reference.id).isEqualTo(entity.id)
        assertThat(reference.name).isEqualTo("Salary")
        assertThat(reference.type).isEqualTo(AccountType.INCOME)
        assertThat(reference.reviseDate).isEqualTo(LocalDate.of(2024, 2, 1))
    }

    @Test
    fun `toEntity from reference - looks up account by id`() {
        val id = UUID.randomUUID()
        val entity = Account(id = id, name = "Bank", type = AccountType.ACCOUNT)
        whenever(accountRepository.findById(id)).thenReturn(Optional.of(entity))

        val result = converter.toEntity(AccountReferenceRecord(id = id, name = "Bank", deleted = false, type = AccountType.ACCOUNT, reviseDate = null))

        assertThat(result).isSameAs(entity)
    }

    @Test
    fun `fillEntity - creates a new entity when given null, clearing externalId for non-account types`() {
        val record = AccountRecord(
            id = null,
            name = "Food",
            type = AccountType.EXPENSE,
            parser = null,
            deleted = false,
            reviseDate = null,
            externalId = "should-be-dropped",
        )

        val entity = converter.fillEntity(null, record)

        assertThat(entity.name).isEqualTo("Food")
        assertThat(entity.type).isEqualTo(AccountType.EXPENSE)
        assertThat(entity.externalId).isNull()
    }

    @Test
    fun `fillEntity - updates an existing entity in place and keeps externalId for account type`() {
        val existing = Account(id = UUID.randomUUID(), name = "Old name", type = AccountType.ACCOUNT)
        val record = AccountRecord(
            id = existing.id,
            name = "New name",
            type = AccountType.ACCOUNT,
            parser = "sber",
            deleted = true,
            reviseDate = LocalDate.of(2024, 3, 1),
            externalId = "ext-42",
        )

        val entity = converter.fillEntity(existing, record)

        assertThat(entity).isSameAs(existing)
        assertThat(entity.name).isEqualTo("New name")
        assertThat(entity.parser).isEqualTo("sber")
        assertThat(entity.deleted).isTrue()
        assertThat(entity.reviseDate).isEqualTo(LocalDate.of(2024, 3, 1))
        assertThat(entity.externalId).isEqualTo("ext-42")
    }
}
