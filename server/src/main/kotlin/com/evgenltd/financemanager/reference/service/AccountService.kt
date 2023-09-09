package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.findAllByCondition
import com.evgenltd.financemanager.common.repository.inList
import com.evgenltd.financemanager.common.repository.like
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class AccountService(
    private val accountRepository: AccountRepository,
    private val accountConverter: AccountConverter
) {

    fun listReference(mask: String?, id: UUID?, types: List<AccountType>?): List<Reference> =
        if (id != null) {
            accountRepository.findByIdOrNull(id)?.let { listOf(accountConverter.toReference(it)) } ?: emptyList()
        } else {
            accountRepository.findAllByCondition {
                (Account.Companion::type inList types) and (Account.Companion::name like mask)
            }.map { accountConverter.toReference(it) }
        }

    fun list(): List<AccountRecord> = accountRepository.findAll().map { accountConverter.toRecord(it) }

    fun byId(id: UUID): AccountRecord = accountRepository.find(id).let { accountConverter.toRecord(it) }

    fun byIdOrNull(id: UUID): Account? = accountRepository.findByIdOrNull(id)

    @Transactional
    fun update(record: AccountRecord) {
        val entity = accountConverter.toEntity(record)
        accountRepository.save(entity)
    }

    @Transactional
    fun delete(id: UUID) {
        val account = accountRepository.findAndLock(id) ?: return
        account.deleted = true
    }

    @Transactional
    fun getOrCreate(name: String, type: AccountType): Account =
        accountRepository.findByName(name)
            ?: accountRepository.save(Account(name = name, type = type))
}