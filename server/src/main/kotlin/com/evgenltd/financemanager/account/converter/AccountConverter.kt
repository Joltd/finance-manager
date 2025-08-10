package com.evgenltd.financemanager.account.converter

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountGroup
import com.evgenltd.financemanager.account.record.AccountBalanceGroupRecord
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.account.repository.AccountRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AccountConverter(
    private val accountRepository: AccountRepository,
    private val accountGroupConverter: AccountGroupConverter,
) {

    fun toRecord(id: UUID): AccountRecord = toRecord(accountRepository.find(id))

    fun toRecord(entity: Account): AccountRecord = AccountRecord(
        id = entity.id,
        name = entity.name,
        type = entity.type,
        group = entity.group?.let { accountGroupConverter.toRecord(it) },
        deleted = entity.deleted,
        reviseDate = entity.reviseDate,
    )

    fun toReference(entity: Account): AccountReferenceRecord = AccountReferenceRecord(
        id = entity.id!!,
        name = entity.name,
        deleted = entity.deleted,
        type = entity.type,
    )

    fun toEntity(record: AccountRecord): Account = Account(
        id = record.id,
        name = record.name,
        type = record.type,
        group = record.group?.let { accountGroupConverter.toEntity(it) },
        deleted = record.deleted,
        reviseDate = record.reviseDate,
    )

}