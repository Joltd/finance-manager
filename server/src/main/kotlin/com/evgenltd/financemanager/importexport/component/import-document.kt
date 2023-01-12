package com.evgenltd.financemanager.importexport.component

import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.web.client.RestTemplate
import java.awt.Desktop
import java.net.URI
import java.time.LocalDate

fun List<RawDataRecord>.performImport(host: String, account: String, rules: String) {

    val result = mapData(account, rules)

    println("Mapped ${result.documents.size} documents")
    println()

    if (result.skipped.isNotEmpty()) {
        result.skipped.onEach { println(it.toString()) }
        println("Some record is not mapped, continue?")
        val decision = readln()
        if (decision != "Yes") {
            return
        }
    }

    if (result.documents.isEmpty()) {
        println("No documents for import")
        return
    }

    result.documents.performImport(host, account)

}

fun List<DocumentEntry>.performImport(host: String, account: String) {
    val apiEndpoint = "$host/import-data"

    val rest = RestTemplate()
    val response = rest.postForObject(
        apiEndpoint,
        ImportData(null, "$account ${LocalDate.now()}"),
        JsonNode::class.java
    )!!

    val id = response["body"]["id"].asText()

    try {
        val chunks = 500
        var counter = 0
        val totalChunks = size / chunks + 1
        chunked(chunks).onEach {
            val request = it.map { ImportDataEntry(
                it.raw,
                it.document
            ) }
            rest.put("$apiEndpoint/$id", request)
            counter++
            println("Added chunk $counter of $totalChunks")
        }
    } catch (e: Exception) {
        rest.delete("$apiEndpoint/$id")
        throw e
    }

    println("Import done")
}

data class ImportData(val id: String?, val description: String)

data class ImportDataEntry(
    val raw: String,
    val suggested: DocumentTypedRecord
)