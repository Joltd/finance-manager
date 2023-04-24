package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.exchangerate.service.ExchangeRateProvider
import com.evgenltd.financemanager.transaction.entity.Relation
import com.evgenltd.financemanager.transaction.entity.Transaction
import com.evgenltd.financemanager.transaction.service.RelationService
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.Period
import kotlin.math.absoluteValue

@Service
@Order(2)
class RelationEntityProvider(
    private val relationService: RelationService,
    private val transactionService: TransactionService
) : ExchangeRateProvider {

    override fun rate(date: LocalDate, from: String, toCurrencies: Set<String>, gap: Long): Map<String, BigDecimal> {
        val dateFrom = date.minusDays(gap)
        val dateTo = date.plusDays(gap)
        val relations = relationService.findRelations(dateFrom, dateTo).filter { it.exchange }
        val transactionIds = relations.flatMap { listOf(it.from, it.to) }.distinct()
        val transactionIndex = transactionService.findTransactions(transactionIds).associateBy { it.id!! }
        val rates = relations.map { it.toRate(transactionIndex) }
            .filter { it.from != it.to }
            .map { Period.between(date, it.date).days.absoluteValue to it }
            .sortedBy { it.first }

        val result = mutableMapOf<String,BigDecimal>()

        for (to in toCurrencies) {
            if (from == to) {
                result[to] = BigDecimal.ONE
                continue
            }

            rates.find { it.second.isMatches(from, to) }
                ?.second
                ?.let { rate ->
                    result[to] = if (rate.from == from && rate.to == to) {
                        rate.value
                    } else {
                        BigDecimal.ONE.divide(rate.value, 10, RoundingMode.HALF_UP)
                    }
                }
        }

        return result
    }

    private fun Relation.toRate(transactionIndex: Map<String, Transaction>) = RelationRate(
        date = date,
        from = transactionIndex[from]!!.amount.currency,
        to = transactionIndex[to]!!.amount.currency,
        value = rate()
    )

}

private data class RelationRate(
    val date: LocalDate,
    val from: String,
    val to: String,
    val value: BigDecimal
) {
    fun isMatches(from: String, to: String): Boolean =
        this.from == from && this.to == to || this.from == to && this.to == from
}