package com.evgenltd.financemanager.importexport.converter

import com.evgenltd.financemanager.importexport.entity.CategoryMapping
import com.evgenltd.financemanager.importexport.record.CategoryMappingRecord
import com.evgenltd.financemanager.account.converter.AccountConverter
import org.springframework.stereotype.Service

@Service
class CategoryMappingConverter(
    private val accountConverter: AccountConverter,
    private val importParserConverter: ImportParserConverter
) {

    fun toRecord(entity: CategoryMapping): CategoryMappingRecord = CategoryMappingRecord(
        id = entity.id,
        parser = importParserConverter.toReference(entity.parser),
        pattern = entity.pattern,
        category = accountConverter.toRecord(entity.category)
    )

    fun toEntity(record: CategoryMappingRecord): CategoryMapping = CategoryMapping(
        id = record.id,
        parser = record.parser.id,
        pattern = record.pattern,
        category = accountConverter.toEntity(record.category)
    )

}