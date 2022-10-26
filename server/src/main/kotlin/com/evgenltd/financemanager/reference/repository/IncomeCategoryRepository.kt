package com.evgenltd.financemanager.reference.repository

import com.evgenltd.financemanager.reference.entity.IncomeCategory
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.repository.findByIdOrNull

interface IncomeCategoryRepository : MongoRepository<IncomeCategory,String> {

    fun findByNameLike(name: String): List<IncomeCategory>

}

fun IncomeCategoryRepository.name(id: String): String = findByIdOrNull(id)?.name ?: id

fun IncomeCategoryRepository.nameOrNull(id: String?): String? = id?.let(::findByIdOrNull)?.name
