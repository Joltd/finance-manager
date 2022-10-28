package com.evgenltd.financemanager.exportdata.component

import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import kotlin.reflect.full.declaredMemberProperties

val FIELDS = listOf(
        "type",
        "accountName",
        "amount",
        "date",
        "description",
        "expenseCategoryName",
        "incomeCategoryName",
        "accountFromName",
        "accountToName",
        "amountFrom",
        "amountTo"
)

fun exportDocument(document: DocumentTypedRecord): String {
    val row = document.value::class.declaredMemberProperties
            .associate {
                it.name to it.getter.call(document.value).toString()
            } + mapOf("type" to document.type)

    return FIELDS.map { row[it] }.joinToString(",")
}