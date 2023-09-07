package com.evgenltd.financemanager.reference.converter

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AccountConverter(
    private val accountRepository: AccountRepository
) {

    fun toRecord(id: UUID): AccountRecord = toRecord(accountRepository.find(id))

    fun toRecord(entity: Account): AccountRecord = AccountRecord(
        id = entity.id,
        name = entity.name,
        type = entity.type,
        deleted = entity.deleted
    )

    fun toReference(entity: Account): Reference = Reference(
        id = entity.id!!,
        name = entity.name,
        deleted = entity.deleted
    )

    fun toEntity(record: AccountRecord): Account = Account(
        id = record.id,
        name = record.name,
        type = record.type,
        deleted = record.deleted
    )

}