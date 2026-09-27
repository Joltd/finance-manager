package com.evgenltd.financemanager.ai.record

import com.evgenltd.financemanager.common.record.TransactionDirection

data class EmbeddingResult(val input: String, val vector: FloatArray)

data class ParseResult(
    val results: List<ParseEntry>,
)

data class ParseEntry(
    val raw: String,
    val date: String?,
    val direction: TransactionDirection?,
    val amount: String?,
    val currency: String?,
    val transactionId: String?,
    val mcc: String?,
    val bankType: String?,
    val bankCategory: String?,
    val merchant: String?,
    val counterparty: String?,
    val purpose: String?,
    val description: String?,
    val message: String?,
)
