package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.account.converter.AccountGroupConverter
import com.evgenltd.financemanager.account.entity.AccountGroup
import com.evgenltd.financemanager.account.record.AccountGroupRecord
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.account.repository.AccountGroupRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class AccountGroupService(
    private val accountGroupRepository: AccountGroupRepository,
    private val accountGroupConverter: AccountGroupConverter
) {

    fun listReference(mask: String?, id: UUID?): List<Reference> {
        val result = if (id != null) {
            accountGroupRepository.findByIdOrNull(id)?.let { listOf(it) } ?: emptyList()
        } else if (!mask.isNullOrEmpty()) {
            accountGroupRepository.findByNameLike("%$mask%")
        } else {
            accountGroupRepository.findAll()
        }

        return result.map { accountGroupConverter.toReference(it) }
            .sortedBy { it.name }
    }

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

    @Transactional
    fun delete(id: UUID) {
        accountGroupRepository.deleteById(id)
    }

    @Transactional
    fun getOrCreate(name: String): AccountGroup =
        accountGroupRepository.findByName(name)
            ?: accountGroupRepository.save(AccountGroup(name = name))
}
