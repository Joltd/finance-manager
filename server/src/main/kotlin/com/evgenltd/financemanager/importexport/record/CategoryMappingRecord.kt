package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.importexport.entity.CategoryType

data class CategoryMappingRecord(
    val id: String?,
    val parser: String,
    val pattern: String,
    val categoryType: CategoryType,
    val category: String,
    val categoryName: String,
)
