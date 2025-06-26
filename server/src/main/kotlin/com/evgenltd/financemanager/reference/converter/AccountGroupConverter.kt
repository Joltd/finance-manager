package com.evgenltd.financemanager.reference.converter

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.reference.entity.AccountGroup
import com.evgenltd.financemanager.reference.record.AccountGroupRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.AccountGroupRepository
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
    )

    fun toReference(entity: AccountGroup): Reference = Reference(
        id = entity.id!!,
        name = entity.name
    )

    fun toEntity(record: AccountGroupRecord): AccountGroup = AccountGroup(
        id = record.id,
        name = record.name
    )
}