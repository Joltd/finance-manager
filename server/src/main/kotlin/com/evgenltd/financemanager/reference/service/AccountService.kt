package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class AccountService(
        private val accountRepository: AccountRepository
) {

    fun listReference(mask: String?, id: String?): List<Reference> {
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

    fun list(): List<AccountRecord> =
            accountRepository.findAll()
                    .map { it.toRecord() }

    fun byId(id: String): AccountRecord = accountRepository.find(id).toRecord()

    fun update(record: AccountRecord) {
        val entity = record.toEntity()
        entity.id
                ?.let { accountRepository.findById(it).orElse(null) }
                ?.let { entity.actualOn = it.actualOn }
        accountRepository.save(entity)
    }

    fun delete(id: String) = accountRepository.deleteById(id)

    fun updateActualOn(id: String, date: LocalDate) {
        accountRepository.findById(id)
                .ifPresent {
                    if (it.track && it.actualOn?.isBefore(date) != false) {
                        it.actualOn = date
                        accountRepository.save(it)
                    }
                }
    }

    private fun Account.toRecord(): AccountRecord = AccountRecord(
            id = id,
            name = name,
            deleted = deleted,
            track = track
    )

    private fun AccountRecord.toEntity(): Account = Account(
            id = id,
            name = name,
            deleted = deleted,
            track = track,
    )
    
}