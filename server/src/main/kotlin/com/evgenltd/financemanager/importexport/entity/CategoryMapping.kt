package com.evgenltd.financemanager.importexport.entity

class CategoryMapping(
    var id: String?,
    var parser: String,
    var pattern: String,
    var categoryType: CategoryType,
    var category: String
)

enum class CategoryType {
    EXPENSE, INCOME
}