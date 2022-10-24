package com.evgenltd.financemanager.reference.entity

class IncomeCategory(
        var id: String?,
        var name: String,
        var deleted: Boolean = false,
        val patterns: List<String> = mutableListOf()
)