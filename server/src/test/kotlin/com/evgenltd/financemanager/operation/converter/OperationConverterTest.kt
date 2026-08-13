package com.evgenltd.financemanager.operation.converter

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.ai.converter.EmbeddingConverter
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.tag.converter.TagConverter
import com.evgenltd.financemanager.tag.entity.Tag
import com.evgenltd.financemanager.tag.record.TagRecord
import com.evgenltd.financemanager.tag.repository.TagRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

class OperationConverterTest {

    private val accountRepository = mock<AccountRepository>()
    private val tagRepository = mock<TagRepository>()
    private val accountConverter = AccountConverter(accountRepository)
    private val embeddingConverter = mock<EmbeddingConverter>()
    private val tagConverter = TagConverter()
    private val converter = OperationConverter(accountRepository, accountConverter, embeddingConverter, tagConverter, tagRepository)

    private val bankAccount = Account(id = UUID.randomUUID(), name = "Bank", type = AccountType.ACCOUNT)
    private val expenseCategory = Account(id = UUID.randomUUID(), name = "Food", type = AccountType.EXPENSE)

    @Test
    fun `toRecord - maps entity fields, accounts and tags`() {
        val tag = Tag(id = UUID.randomUUID(), name = "Groceries")
        val entity = Operation(
            id = UUID.randomUUID(),
            date = LocalDate.of(2024, 1, 15),
            type = OperationType.EXPENSE,
            amountFrom = Amount(1000000L, "USD"),
            accountFrom = bankAccount,
            amountTo = Amount(1000000L, "USD"),
            accountTo = expenseCategory,
            description = "Groceries",
            tags = mutableListOf(tag),
        )

        val record = converter.toRecord(entity)

        assertThat(record.id).isEqualTo(entity.id)
        assertThat(record.date).isEqualTo(LocalDate.of(2024, 1, 15))
        assertThat(record.type).isEqualTo(OperationType.EXPENSE)
        assertThat(record.accountFrom.id).isEqualTo(bankAccount.id)
        assertThat(record.accountTo.id).isEqualTo(expenseCategory.id)
        assertThat(record.description).isEqualTo("Groceries")
        assertThat(record.hint).isNull()
        assertThat(record.tags).extracting("id").containsExactly(tag.id)
    }

    @Test
    fun `fillEntity - creates a new entity, resolving accounts and tags by id`() {
        whenever(accountRepository.findById(bankAccount.id!!)).thenReturn(Optional.of(bankAccount))
        whenever(accountRepository.findById(expenseCategory.id!!)).thenReturn(Optional.of(expenseCategory))
        val tag = Tag(id = UUID.randomUUID(), name = "Groceries")
        whenever(tagRepository.findById(tag.id!!)).thenReturn(Optional.of(tag))

        val record = OperationRecord(
            id = null,
            date = LocalDate.of(2024, 1, 15),
            type = OperationType.EXPENSE,
            amountFrom = Amount(1000000L, "USD"),
            accountFrom = accountConverter.toRecord(bankAccount),
            amountTo = Amount(1000000L, "USD"),
            accountTo = accountConverter.toRecord(expenseCategory),
            description = "Groceries",
            tags = listOf(TagRecord(id = tag.id, name = tag.name, deleted = false)),
        )

        val entity = converter.fillEntity(null, record)

        assertThat(entity.date).isEqualTo(LocalDate.of(2024, 1, 15))
        assertThat(entity.type).isEqualTo(OperationType.EXPENSE)
        assertThat(entity.accountFrom).isSameAs(bankAccount)
        assertThat(entity.accountTo).isSameAs(expenseCategory)
        assertThat(entity.tags).containsExactly(tag)
    }

    @Test
    fun `toChangeRecord - flattens accounts to id and type`() {
        val entity = Operation(
            id = UUID.randomUUID(),
            date = LocalDate.of(2024, 1, 15),
            type = OperationType.EXPENSE,
            amountFrom = Amount(1000000L, "USD"),
            accountFrom = bankAccount,
            amountTo = Amount(1000000L, "USD"),
            accountTo = expenseCategory,
            description = "Groceries",
        )

        val record = converter.toChangeRecord(entity)

        assertThat(record.id).isEqualTo(entity.id)
        assertThat(record.accountFrom).isEqualTo(bankAccount.id)
        assertThat(record.accountFromType).isEqualTo(AccountType.ACCOUNT)
        assertThat(record.accountTo).isEqualTo(expenseCategory.id)
        assertThat(record.accountToType).isEqualTo(AccountType.EXPENSE)
    }
}
