package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.CategoryMapping
import org.springframework.data.mongodb.repository.MongoRepository

interface CategoryMappingRepository : MongoRepository<CategoryMapping, String> {

    fun findByParser(parser: String): List<CategoryMapping>

}