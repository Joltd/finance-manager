package com.evgenltd.financemanager.account.converter

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.account.repository.AccountGroupRepository
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.repository.find
import org.springframework.stereotype.Service
import java.util.*

@Service
class AccountConverter(
    private val accountRepository: AccountRepository,
    private val accountGroupRepository: AccountGroupRepository,
    private val accountGroupConverter: AccountGroupConverter,
) {

    fun toRecord(id: UUID): AccountRecord = toRecord(accountRepository.find(id))

    fun toRecord(entity: Account): AccountRecord = AccountRecord(
        id = entity.id,
        name = entity.name,
        type = entity.type,
        parser = entity.parser,
        group = entity.group?.let { accountGroupConverter.toRecord(it) },
        deleted = entity.deleted,
        reviseDate = entity.reviseDate,
    )

    fun toReference(entity: Account): Reference = Reference(
        id = entity.id!!,
        name = entity.name,
        deleted = entity.deleted,
    )

    fun toAccountReference(entity: Account): AccountReferenceRecord = AccountReferenceRecord(
        id = entity.id!!,
        name = entity.name,
        deleted = entity.deleted,
        type = entity.type,
        reviseDate = entity.reviseDate,
    )

    fun toEntity(record: AccountReferenceRecord): Account = accountRepository.find(record.id)

    fun fillEntity(entity: Account?, record: AccountRecord): Account = entity?.also {
        it.name = record.name
        it.type = record.type
        it.parser = record.parser
        it.group = record.group?.id?.let { id -> accountGroupRepository.find(id) }
        it.deleted = record.deleted
        it.reviseDate = record.reviseDate
    } ?: Account(
        id = record.id,
        name = record.name,
        type = record.type,
        parser = record.parser,
        group = record.group?.id?.let { id -> accountGroupRepository.find(id) },
        deleted = record.deleted,
        reviseDate = record.reviseDate,
    )

}