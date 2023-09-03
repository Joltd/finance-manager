package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.record.Reference
import java.util.UUID

data class CategoryMappingFilter(
    val page: Int,
    val size: Int = 50,
    val parser: String? = null,
    val category: AccountRecord? = null,
)

data class CategoryMappingPage(
    val total: Long,
    val page: Int,
    val size: Int,
    val mappings: List<CategoryMappingRecord>
)

data class CategoryMappingRecord(
    val id: UUID?,
    val parser: Reference,
    val pattern: String,
    val category: AccountRecord,
)
