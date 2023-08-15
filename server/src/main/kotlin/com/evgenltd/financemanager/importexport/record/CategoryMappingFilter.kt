package com.evgenltd.financemanager.importexport.record

data class CategoryMappingFilter(
    val page: Int,
    val size: Int = 50,
    val parser: String? = null,
    val category: String? = null
)