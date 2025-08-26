package com.evgenltd.financemanager.account.converter

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.account.entity.AccountGroup
import com.evgenltd.financemanager.account.record.AccountGroupRecord
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.account.repository.AccountGroupRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AccountGroupConverter(
    private val accountGroupRepository: AccountGroupRepository
) {

    fun toRecord(id: UUID): AccountGroupRecord = toRecord(accountGroupRepository.find(id))

    fun toRecord(entity: AccountGroup): AccountGroupRecord = AccountGroupRecord(
        id = entity.id,
        name = entity.name,
        deleted = entity.deleted,
    )

    fun toReference(entity: AccountGroup): Reference = Reference(
        id = entity.id!!,
        name = entity.name,
        deleted = entity.deleted,
    )

    fun fillEntity(entity: AccountGroup?, record: AccountGroupRecord): AccountGroup = entity?.also {
        it.name = record.name
        it.deleted = record.deleted
    } ?: AccountGroup(
        id = record.id,
        name = record.name,
        deleted = record.deleted,
    )
}
