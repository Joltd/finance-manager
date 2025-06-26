package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.findAllByCondition
import com.evgenltd.financemanager.common.repository.like
import com.evgenltd.financemanager.reference.converter.AccountGroupConverter
import com.evgenltd.financemanager.reference.entity.AccountGroup
import com.evgenltd.financemanager.reference.record.AccountGroupRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.AccountGroupRepository
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
    fun update(record: AccountGroupRecord) {
        val entity = accountGroupConverter.toEntity(record)
        accountGroupRepository.save(entity)
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
