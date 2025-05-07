package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.findAllByCondition
import com.evgenltd.financemanager.importexport.converter.CategoryMappingConverter
import com.evgenltd.financemanager.importexport.entity.CategoryMapping
import com.evgenltd.financemanager.importexport.record.CategoryMappingFilter
import com.evgenltd.financemanager.importexport.record.CategoryMappingPage
import com.evgenltd.financemanager.importexport.record.CategoryMappingRecord
import com.evgenltd.financemanager.importexport.repository.CategoryMappingRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CategoryMappingService(
    private val categoryMappingRepository: CategoryMappingRepository,
    private val categoryMappingConverter: CategoryMappingConverter
) {

    fun list(filter: CategoryMappingFilter): CategoryMappingPage =
        categoryMappingRepository.findAllByCondition(filter.page, filter.size) {
            (CategoryMapping.Companion::parser eq filter.parser?.id) and
            (CategoryMapping.Companion::categoryId eq filter.category?.id)
        }.let {
            CategoryMappingPage(
                total = it.totalElements,
                page = filter.page,
                size = filter.size,
                mappings = it.content
                    .sortedBy { it.pattern }
                    .map { entry -> categoryMappingConverter.toRecord(entry) }
            )
        }

    fun byId(id: UUID): CategoryMappingRecord = categoryMappingRepository.find(id).let { categoryMappingConverter.toRecord(it) }

    fun update(record: CategoryMappingRecord) {
        categoryMappingRepository.save(categoryMappingConverter.toEntity(record))
    }

    fun delete(id: UUID) {
        categoryMappingRepository.deleteById(id)
    }

    fun findByParser(parser: UUID): List<Pair<Regex, CategoryMapping>> =
        categoryMappingRepository.findByParser(parser).map { ".*${it.pattern}.*".toRegex() to it }

}