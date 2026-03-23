package com.evgenltd.financemanager.ai.record

data class EmbeddingResult(val input: String, val vector: FloatArray)

data class ParseResult(
    val results: List<ParseEntry>,
)

data class ParseEntry(
    val raw: String,
    val date: String?,
    val amount: String?,
    val currency: String?,
    val description: String?,
    val hint: String?,
)