package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.reference.entity.IncomeCategory
import com.evgenltd.financemanager.reference.record.IncomeCategoryRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.IncomeCategoryRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class IncomeCategoryService(
    val incomeCategoryRepository: IncomeCategoryRepository
) {

    fun listReference(mask: String? = null, id: String? = null): List<Reference> {
        val list = if (mask?.isNotEmpty() == true) {
            incomeCategoryRepository.findByNameLike(mask)
        } else if (id != null) {
            incomeCategoryRepository.findById(id)
                    .map { listOf(it) }
                    .orElse(emptyList())
        } else {
            incomeCategoryRepository.findAll()
        }
        return list.map { Reference(it.id!!, it.name, it.deleted) }
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

    @Transactional
    fun findOrCreate(id: String?, name: String?): IncomeCategory = id
        ?.let { incomeCategoryRepository.findByIdOrNull(it) }
        ?: name?.let { incomeCategoryRepository.findByName(it) }
        ?: name?.let { incomeCategoryRepository.save(IncomeCategory(null, it)) }
        ?: throw IllegalArgumentException("Id or Name should be specified")

    fun name(id: String): String = incomeCategoryRepository.findByIdOrNull(id)?.name ?: id

    private fun IncomeCategory.toRecord(): IncomeCategoryRecord = IncomeCategoryRecord(
            id = id,
            name = name,
            deleted = deleted
    )

    private fun IncomeCategoryRecord.toEntity(): IncomeCategory = IncomeCategory(
            id = id,
            name = name,
            deleted = deleted
    )

}