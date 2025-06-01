package com.evgenltd.financemanager.common.util

import com.evgenltd.financemanager.operation.entity.OperationType
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate

fun BigDecimal.oppositeRate(): BigDecimal = BigDecimal.ONE.divide(this, Amount.SCALE * 2, RoundingMode.HALF_UP)

fun operationEmbeddingInput(
    date: LocalDate,
    type: OperationType,
    amountFrom: Amount,
    accountFrom: String?,
    amountTo: Amount,
    accountTo: String?,
): String {
    val actualAccountFrom = accountFrom ?: "Unknown"
    val actualAccountTo = accountTo ?: "Unknown"
    return when (type) {
        OperationType.EXCHANGE -> "Exchange on $date, $amountFrom to $amountTo from $actualAccountFrom to $actualAccountTo"
        else -> "${
            type.name.lowercase().replaceFirstChar { it.uppercase() }
        } on $date, $amountFrom from $actualAccountFrom to $actualAccountTo"
    }
}