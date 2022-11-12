package com.evgenltd.financemanager.importexport.component

import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import java.io.File
import kotlin.reflect.full.declaredMemberProperties

val DESTINATION_PATH = """C:\Users\lebed\Dropbox\Diary\Home\finance\documents\input"""
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
                it.name to it.getter.call(document.value).toString().replace(",", "")
            } + mapOf("type" to document.type)

    return FIELDS.map { row[it] }.joinToString(",")
}

fun List<DocumentTypedRecord>.export(path: String) {
    val data = joinToString("\n") { exportDocument(it) }
    val header = FIELDS.joinToString(",")
    val all = "$header\n$data"
    File("""$DESTINATION_PATH\$path""").writeText(all)
}