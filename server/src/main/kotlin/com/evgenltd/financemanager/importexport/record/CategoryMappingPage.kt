package com.evgenltd.financemanager.importexport.record

data class CategoryMappingPage(
    val total: Long,
    val page: Int,
    val size: Int,
    val mappings: List<CategoryMappingRecord>
)