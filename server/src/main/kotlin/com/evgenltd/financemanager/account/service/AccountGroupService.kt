package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.account.converter.AccountGroupConverter
import com.evgenltd.financemanager.account.entity.AccountGroup
import com.evgenltd.financemanager.account.record.AccountGroupRecord
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.account.repository.AccountGroupRepository
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.like
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class AccountGroupService(
    private val accountGroupRepository: AccountGroupRepository,
    private val accountGroupConverter: AccountGroupConverter,
) {

    fun listReference(mask: String?, id: UUID?): List<Reference> =
        ((AccountGroup::name like mask) and (AccountGroup::id eq id))
            .let { accountGroupRepository.findAll(it, Sort.by(AccountGroup::name.name)) }
            .map { accountGroupConverter.toReference(it) }

    fun list(): List<AccountGroupRecord> = accountGroupRepository.findAll()
        .map { accountGroupConverter.toRecord(it) }
        .sortedBy { it.name }

    fun byId(id: UUID): AccountGroupRecord = accountGroupRepository.find(id).let { accountGroupConverter.toRecord(it) }

    @Transactional
    fun update(record: AccountGroupRecord): AccountGroupRecord {
        val entity = accountGroupConverter.toEntity(record)
        val saved = accountGroupRepository.save(entity)
        return accountGroupConverter.toRecord(saved)
    }

    fun delete(id: UUID) {
        try {
            val accountGroup = accountGroupRepository.find(id)
            accountGroupRepository.delete(accountGroup)
        } catch (e: DataIntegrityViolationException) {
            val accountGroup = accountGroupRepository.find(id)
            accountGroup.deleted = true
            accountGroupRepository.save(accountGroup)
        }
    }

}
