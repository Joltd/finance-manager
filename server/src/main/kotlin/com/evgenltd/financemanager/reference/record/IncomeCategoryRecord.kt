package com.evgenltd.financemanager.reference.record

data class IncomeCategoryRecord(
        val id: String?,
        val name: String,
        val deleted: Boolean,
        val patterns: List<String>
)