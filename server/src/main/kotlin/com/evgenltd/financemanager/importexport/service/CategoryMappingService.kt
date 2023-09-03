package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.findAllByCondition
import com.evgenltd.financemanager.importexport.entity.CategoryMapping
import com.evgenltd.financemanager.importexport.record.CategoryMappingFilter
import com.evgenltd.financemanager.importexport.record.CategoryMappingPage
import com.evgenltd.financemanager.importexport.record.CategoryMappingRecord
import com.evgenltd.financemanager.importexport.repository.CategoryMappingRepository
import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import com.evgenltd.financemanager.reference.record.toRecord
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CategoryMappingService(
    private val categoryMappingRepository: CategoryMappingRepository,
    private val importParserService: ImportParserService,
    private val accountRepository: AccountRepository
) {

    fun list(filter: CategoryMappingFilter): CategoryMappingPage =
        categoryMappingRepository.findAllByCondition(PageRequest.of(filter.page, filter.size)) {
            (CategoryMapping.Companion::parser eq filter.parser) and
            (CategoryMapping.Companion::categoryId eq filter.category?.id)
        }.let {
            CategoryMappingPage(
                total = it.totalElements,
                page = filter.page,
                size = filter.size,
                mappings = it.content.map { it.toRecord() }
            )
        }

    fun byId(id: UUID): CategoryMappingRecord = categoryMappingRepository.find(id).toRecord()

    fun update(record: CategoryMappingRecord) {
        categoryMappingRepository.save(record.toEntity())
    }

    fun delete(id: UUID) {
        categoryMappingRepository.deleteById(id)
    }

    private fun CategoryMapping.toRecord(): CategoryMappingRecord = CategoryMappingRecord(
        id = id,
        parser = importParserService.byId(parser),
        pattern = pattern,
        category = category.toRecord()
    )

    private fun CategoryMappingRecord.toEntity(): CategoryMapping = CategoryMapping(
        id = id,
        parser = parser.id,
        pattern = pattern,
        category = accountRepository.find(category.id)
    )

}