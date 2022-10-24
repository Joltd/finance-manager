package com.evgenltd.financemanager.document.record

import com.evgenltd.financemanager.document.entity.Document
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.annotation.JsonDeserialize

@JsonDeserialize(using = DocumentTypedRecordDeserializer::class)
class DocumentTypedRecord(
        val type: String,
        val value: DocumentRecord
) {

    fun toEntity(): Document = when (value) {
        is DocumentExpenseRecord -> value.toEntity()
        is DocumentIncomeRecord -> value.toEntity()
        is DocumentExchangeRecord -> value.toEntity()
        else -> throw IllegalStateException("Unknown document type ${this::class}")
    }

}

class DocumentTypedRecordDeserializer : JsonDeserializer<DocumentTypedRecord>() {

    override fun deserialize(parser: JsonParser, ctxt: DeserializationContext): DocumentTypedRecord {
        val node = parser.codec.readTree<JsonNode>(parser)
        val type = node["type"].asText()
        val documentRecordClass = when (type) {
            "expense" -> DocumentExpenseRecord::class.java
            "income" -> DocumentIncomeRecord::class.java
            "exchange" -> DocumentExchangeRecord::class.java
            else -> throw IllegalStateException("Unknown document type $type")
        }
        val documentRecord = parser.codec.treeToValue(node["value"], documentRecordClass)
        return DocumentTypedRecord(
                type = type,
                value = documentRecord
        )
    }

}