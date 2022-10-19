package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.reference.entity.ExpenseCategory
import com.evgenltd.financemanager.reference.entity.IncomeCategory
import com.evgenltd.financemanager.reference.record.ExpenseCategoryRecord
import com.evgenltd.financemanager.reference.record.IncomeCategoryRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.ExpenseCategoryRepository
import com.evgenltd.financemanager.reference.repository.IncomeCategoryRepository
import org.springframework.stereotype.Service

@Service
class IncomeCategoryService(
        val incomeCategoryRepository: IncomeCategoryRepository
) {

    fun listReference(mask: String?, id: String?): List<Reference> {
        val list = if (mask?.isNotEmpty() == true) {
            incomeCategoryRepository.findByNameLike(mask)
        } else if (id != null) {
            incomeCategoryRepository.findById(id)
                    .map { listOf(it) }
                    .orElse(emptyList())
        } else {
            incomeCategoryRepository.findAll()
        }
        return list.map { Reference(it.id!!, it.name!!, it.deleted ?: false) }
    }

    fun list(): List<IncomeCategoryRecord> =
            incomeCategoryRepository.findAll()
                    .map { it.toRecord() }

    fun byId(id: String): IncomeCategoryRecord = incomeCategoryRepository.find(id).toRecord()

    fun update(record: IncomeCategoryRecord) {
        val entity = record.toEntity()
        incomeCategoryRepository.save(entity)
    }

    fun delete(id: String) = incomeCategoryRepository.deleteById(id)

    private fun IncomeCategory.toRecord(): IncomeCategoryRecord = IncomeCategoryRecord(
            id,
            name,
            deleted
    )

    private fun IncomeCategoryRecord.toEntity(): IncomeCategory = IncomeCategory(
            id,
            name,
            deleted
    )

}