package com.evgenltd.financemanager.importexport.record

data class CategoryMappingRecord(
    val id: String?,
    val parser: String,
    val parserName: String? = null,
    val pattern: String,
    val categoryType: String,
    val category: String,
    val categoryName: String? = null,
)
