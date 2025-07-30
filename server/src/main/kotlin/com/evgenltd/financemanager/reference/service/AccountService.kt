package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.like
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class AccountService(
    private val accountRepository: AccountRepository,
    private val accountConverter: AccountConverter
) {

    fun listReference(mask: String?, type: AccountType?): List<AccountRecord> {
        val filter = (Account::type eq type) and (Account::name like mask)
        val pageable = PageRequest.of(0, 20, Sort.by(Account::name.name))
        return accountRepository.findAll(filter, pageable)
            .content
            .map { accountConverter.toRecord(it) }
    }

    fun list(): List<AccountRecord> = accountRepository.findAll()
        .map { accountConverter.toRecord(it) }
        .sortedBy { it.name }

    fun byId(id: UUID): AccountRecord = accountRepository.find(id).let { accountConverter.toRecord(it) }

    fun byIdOrNull(id: UUID): Account? = accountRepository.findByIdOrNull(id)

    @Transactional
    fun update(record: AccountRecord): AccountRecord {
        val entity = accountConverter.toEntity(record)
        val saved = accountRepository.save(entity)
        return accountConverter.toRecord(saved)
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