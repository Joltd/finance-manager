package com.evgenltd.financemanager.reference.repository

import com.evgenltd.financemanager.reference.entity.ExpenseCategory
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.repository.findByIdOrNull

interface ExpenseCategoryRepository : MongoRepository<ExpenseCategory,String> {

    fun findByNameLike(name: String): List<ExpenseCategory>

}

fun ExpenseCategoryRepository.name(id: String): String = findByIdOrNull(id)?.name ?: id

fun ExpenseCategoryRepository.nameOrNull(id: String?): String? = id?.let(::findByIdOrNull)?.name
