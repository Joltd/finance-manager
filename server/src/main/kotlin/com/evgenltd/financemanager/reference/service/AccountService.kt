package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.findAllByCondition
import com.evgenltd.financemanager.common.repository.inList
import com.evgenltd.financemanager.common.repository.like
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.record.toRecord
import com.evgenltd.financemanager.reference.record.toReference
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AccountService(private val accountRepository: AccountRepository) {

    fun listReference(mask: String? = null, id: UUID? = null, types: List<AccountType>): List<Reference> =
        if (id != null) {
            accountRepository.findByIdOrNull(id)?.let { listOf(it.toReference()) } ?: emptyList()
        } else {
            accountRepository.findAllByCondition {
                (Account.Companion::type inList types) and (Account.Companion::name like mask)
            }.map { it.toReference() }
        }

    fun list(): List<AccountRecord> = accountRepository.findAll().map { it.toRecord() }

    fun byId(id: UUID): AccountRecord = accountRepository.find(id).toRecord()

    fun byIdOrNull(id: UUID): Account? = accountRepository.findByIdOrNull(id)

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

    private fun AccountRecord.toEntity(): Account = Account(
        id = id,
        name = name,
        type = type,
        deleted = deleted
    )
    
}