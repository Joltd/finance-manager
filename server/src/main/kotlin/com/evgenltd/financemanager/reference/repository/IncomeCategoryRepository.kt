package com.evgenltd.financemanager.reference.repository

import com.evgenltd.financemanager.reference.entity.IncomeCategory
import org.springframework.data.mongodb.repository.MongoRepository

interface IncomeCategoryRepository : MongoRepository<IncomeCategory,String> {

    fun findByNameLike(name: String): List<IncomeCategory>

    fun findByName(name: String): IncomeCategory?

}