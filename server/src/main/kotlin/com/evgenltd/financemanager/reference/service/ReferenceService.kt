package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.ExpenseCategory
import com.evgenltd.financemanager.reference.entity.IncomeCategory
import com.evgenltd.financemanager.reference.repository.AccountRepository
import com.evgenltd.financemanager.reference.repository.ExpenseCategoryRepository
import com.evgenltd.financemanager.reference.repository.IncomeCategoryRepository
import org.springframework.stereotype.Service

@Service
class ReferenceService(
    private val expenseCategoryRepository: ExpenseCategoryRepository,
    private val incomeCategoryRepository: IncomeCategoryRepository
) {

    fun expenseCategoryIndex(): Map<String, ExpenseCategory> = expenseCategoryRepository.findAll().associateBy { it.id!! }

    fun incomeCategoryIndex(): Map<String, IncomeCategory> = incomeCategoryRepository.findAll().associateBy { it.id!! }

}