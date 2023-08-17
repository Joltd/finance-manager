package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.importexport.entity.CategoryMapping
import com.evgenltd.financemanager.importexport.record.CategoryMappingFilter
import com.evgenltd.financemanager.importexport.record.CategoryMappingPage
import com.evgenltd.financemanager.importexport.record.CategoryMappingRecord
import com.evgenltd.financemanager.importexport.repository.CategoryMappingRepository
import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import com.evgenltd.financemanager.reference.service.ExpenseCategoryService
import com.evgenltd.financemanager.reference.service.IncomeCategoryService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.inValues
import org.springframework.data.mongodb.core.query.isEqualTo
import org.springframework.stereotype.Service

@Service
class CategoryMappingService(
    private val categoryMappingRepository: CategoryMappingRepository,
    private val expenseCategoryService: ExpenseCategoryService,
    private val incomeCategoryService: IncomeCategoryService,
    private val importParsers: List<ImportParser>,
    private val mongoTemplate: MongoTemplate,
) {

    fun list(filter: CategoryMappingFilter): CategoryMappingPage {
        var query = Criteria.where("").isEqualTo("")
            .parserCondition(filter)
            .categoryCondition(filter)
            .let { Query().addCriteria(it) }
        val count = mongoTemplate.count(query, CategoryMapping::class.java)
        query = query.with(Sort.by(Sort.Direction.DESC, "parser"))
            .with(PageRequest.of(filter.page, filter.size))
        return CategoryMappingPage(
            total = count,
            page = filter.page,
            size = filter.size,
            mappings = mongoTemplate.find(query, CategoryMapping::class.java)
                .map { it.toRecord() }
        )
    }

    private fun Criteria.parserCondition(filter: CategoryMappingFilter): Criteria =
        filter.parser?.let { value -> and(CategoryMapping::parser.name).isEqualTo(value) } ?: this

    private fun Criteria.categoryCondition(filter: CategoryMappingFilter): Criteria =
        if (filter.category.isEmpty()) this
        else and(CategoryMapping::category.name).inValues(filter.category)

    fun byId(id: String): CategoryMappingRecord = categoryMappingRepository.find(id).toRecord()

    fun update(record: CategoryMappingRecord) {
        categoryMappingRepository.save(record.toEntity())
    }

    fun delete(id: String) {
        categoryMappingRepository.deleteById(id)
    }

    fun toCategoryMappingRecord(entity: CategoryMapping): CategoryMappingRecord = entity.toRecord()

    private fun CategoryMapping.toRecord(): CategoryMappingRecord =
        CategoryMappingRecord(
            id = id,
            parser = parser,
            parserName = importParsers.find { it.id == parser }?.name ?: parser,
            pattern = pattern,
            categoryType = categoryType,
            category = category,
            categoryName = when (categoryType) {
                "expense" -> expenseCategoryService.name(category)
                "income" -> incomeCategoryService.name(category)
                else -> "<Unknown>"
            }
        )

    private fun CategoryMappingRecord.toEntity(): CategoryMapping =
        CategoryMapping(
            id = id,
            parser = parser,
            pattern = pattern,
            categoryType = categoryType,
            category = category,
        )

}