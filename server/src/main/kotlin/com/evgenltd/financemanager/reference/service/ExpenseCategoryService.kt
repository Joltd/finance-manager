package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.reference.entity.ExpenseCategory
import com.evgenltd.financemanager.reference.record.ExpenseCategoryRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.record.ReferencePattern
import com.evgenltd.financemanager.reference.repository.ExpenseCategoryRepository
import org.springframework.stereotype.Service

@Service
class ExpenseCategoryService(
        val expenseCategoryRepository: ExpenseCategoryRepository
) {

    fun listReference(mask: String?, id: String?): List<Reference> {
        val list = if (mask?.isNotEmpty() == true) {
            expenseCategoryRepository.findByNameLike(mask)
        } else if (id != null) {
            expenseCategoryRepository.findById(id)
                    .map { listOf(it) }
                    .orElse(emptyList())
        } else {
            expenseCategoryRepository.findAll()
        }
        return list.map { Reference(it.id!!, it.name!!, it.deleted ?: false) }
    }

    fun list(): List<ExpenseCategoryRecord> =
            expenseCategoryRepository.findAll()
                    .map { it.toRecord() }

    fun byId(id: String): ExpenseCategoryRecord = expenseCategoryRepository.find(id).toRecord()

    fun update(record: ExpenseCategoryRecord) {
        val entity = record.toEntity()
        expenseCategoryRepository.save(entity)
    }

    fun delete(id: String) = expenseCategoryRepository.deleteById(id)

    fun patterns(): List<ReferencePattern> = expenseCategoryRepository.findAll()
            .map { it.patterns.map { pattern -> ReferencePattern(it.id!!, pattern.toRegex()) } }
            .flatten()

    private fun ExpenseCategory.toRecord(): ExpenseCategoryRecord = ExpenseCategoryRecord(
            id = id,
            name = name,
            deleted = deleted,
            patterns = patterns
    )

    private fun ExpenseCategoryRecord.toEntity(): ExpenseCategory = ExpenseCategory(
            id = id,
            name = name,
            deleted = deleted,
            patterns = patterns
    )

}