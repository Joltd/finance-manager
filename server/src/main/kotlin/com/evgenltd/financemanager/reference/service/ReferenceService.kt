package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.reference.repository.AccountRepository
import com.evgenltd.financemanager.reference.repository.ExpenseCategoryRepository
import com.evgenltd.financemanager.reference.repository.IncomeCategoryRepository
import org.springframework.stereotype.Service

@Service
class ReferenceService(
    private val expenseCategoryRepository: ExpenseCategoryRepository,
    private val incomeCategoryRepository: IncomeCategoryRepository
) {

    fun expenseCategoryIndex(): Map<String, String> = expenseCategoryRepository.findAll().associate { it.id!! to it.name }

    fun incomeCategoryIndex(): Map<String, String> = incomeCategoryRepository.findAll().associate { it.id!! to it.name }

}