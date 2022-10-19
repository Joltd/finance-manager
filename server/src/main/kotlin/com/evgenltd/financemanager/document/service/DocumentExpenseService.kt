package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.entity.DocumentExpense
import com.evgenltd.financemanager.document.record.DocumentExpenseRecord
import com.evgenltd.financemanager.document.repository.DocumentExpenseRepository
import org.springframework.stereotype.Service

@Service
class DocumentExpenseService(
        private val documentExpenseRepository: DocumentExpenseRepository
) {

    fun byId(id: String): DocumentExpenseRecord = documentExpenseRepository.find(id).toRecord()

    fun update(record: DocumentExpenseRecord) {
        val entity = record.toEntity()
        documentExpenseRepository.save(entity)
    }

    fun delete(id: String) = documentExpenseRepository.deleteById(id)

    private fun DocumentExpense.toRecord(): DocumentExpenseRecord = DocumentExpenseRecord(
            id = id,
            date = date,
            description = description,
            amount = amount,
            account = account,
            expenseCategory = expenseCategory
    )

    private fun DocumentExpenseRecord.toEntity(): DocumentExpense = DocumentExpense(
            id = id,
            date = date,
            description = description,
            amount = amount,
            account = account,
            expenseCategory = expenseCategory
    )

}