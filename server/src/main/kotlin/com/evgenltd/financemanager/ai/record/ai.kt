package com.evgenltd.financemanager.ai.record

import java.math.BigDecimal
import java.time.LocalDate

data class EmbeddingResult(val input: String, val vector: FloatArray)

data class ParseResult(
    val results: List<ParseEntry>,
)

data class ParseEntry(
    val date: LocalDate?,
    val direction: BankTransactionDirection?,
    val amount: BigDecimal?,
    val currency: String?,
    val transactionId: String?,
    val bankType: String?,
    val bankCategory: String?,
    val merchant: String?,
    val counterparty: String?,
    val mcc: String?,
    val purpose: String?,
    val raw: String?,
    val description: String?,
    val message: String?,
)

enum class BankTransactionDirection {
    IN,
    OUT,
}
