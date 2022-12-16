package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.reference.entity.ExpenseCategory
import com.evgenltd.financemanager.reference.record.ExpenseCategoryRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.ExpenseCategoryRepository
import org.springframework.data.repository.findByIdOrNull
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
        return list.map { Reference(it.id!!, it.name, it.deleted) }
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

    fun findOrCreate(id: String?, name: String?): ExpenseCategory = id
        ?.let { expenseCategoryRepository.findByIdOrNull(it) }
        ?: name?.let { expenseCategoryRepository.findByName(it) }
        ?: name?.let { expenseCategoryRepository.save(ExpenseCategory(null, it)) }
        ?: throw IllegalArgumentException("Id or Name should be specified")

    fun name(id: String): String = expenseCategoryRepository.findByIdOrNull(id)?.name ?: id

    private fun ExpenseCategory.toRecord(): ExpenseCategoryRecord = ExpenseCategoryRecord(
            id = id,
            name = name,
            deleted = deleted
    )

    private fun ExpenseCategoryRecord.toEntity(): ExpenseCategory = ExpenseCategory(
            id = id,
            name = name,
            deleted = deleted
    )

}