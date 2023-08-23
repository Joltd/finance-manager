package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AccountService(private val accountRepository: AccountRepository) {

    fun listReference(mask: String? = null, id: UUID? = null): List<Reference> {
        val list = if (mask?.isNotEmpty() == true) {
            accountRepository.findByNameLike(mask)
        } else if (id != null) {
            accountRepository.findById(id)
                    .map { listOf(it) }
                    .orElse(emptyList())
        } else {
            accountRepository.findAll()
        }
        return list.map { Reference(it.id!!, it.name, it.deleted) }
    }

    fun list(): List<AccountRecord> = accountRepository.findAll().map { it.toRecord() }

    fun byId(id: UUID): AccountRecord = accountRepository.find(id).toRecord()

    @Transactional
    fun update(record: AccountRecord) {
        val entity = record.toEntity()
        accountRepository.save(entity)
    }

    @Transactional
    fun delete(id: UUID) {
        val account = accountRepository.findAndLock(id) ?: return
        account.deleted = true
    }

    private fun Account.toRecord(): AccountRecord = AccountRecord(
        id = id,
        name = name,
        type = type,
        deleted = deleted
    )

    private fun AccountRecord.toEntity(): Account = Account(
        id = id,
        name = name,
        type = type,
        deleted = deleted
    )
    
}