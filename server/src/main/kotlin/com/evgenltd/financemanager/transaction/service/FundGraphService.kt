package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.Fund
import com.evgenltd.financemanager.transaction.entity.Relation
import com.evgenltd.financemanager.transaction.entity.Transaction
import com.evgenltd.financemanager.transaction.event.RebuildGraphEvent
import com.evgenltd.financemanager.transaction.event.ResetGraphEvent
import com.evgenltd.financemanager.transaction.record.FlowRecord
import com.evgenltd.financemanager.transaction.record.FlowsRecord
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate

@Service
class FundGraphService(
    private val transactionService: TransactionService,
    private val relationService: RelationService,
    private val fundSnapshotService: FundSnapshotService,
    private val exchangeRateService: ExchangeRateService
) : Loggable() {

    @EventListener
    @Transactional
    fun onResetGraph(event: ResetGraphEvent) {
        resetGraph(event.date)
    }

    @Transactional
    fun resetGraph(date: LocalDate) {
        fundSnapshotService.deleteNotActualSnapshots(date)
        val fundSnapshot = fundSnapshotService.findLastActualHistorySnapshot()
        val fixationDate = fundSnapshot?.date ?: MIN_DATE
        relationService.deleteNotActual(fixationDate)
        fundSnapshotService.currentSnapshotOutdated(date)
    }

    @EventListener
    @Transactional
    fun onRebuildGraph(event: RebuildGraphEvent) {
        try {
            rebuildGraph()
        } catch (e: Exception) {
            log.error("Error while rebuilding graph", e)
        }
    }

    @Transactional
    @Async
    fun startResetAndRebuildGraph() {
        resetGraph(MIN_DATE)
        rebuildGraph()
    }

    @Transactional
    @Async
    fun startRebuildGraph() {
        rebuildGraph()
    }

    private fun rebuildGraph() {
        val fundSnapshot = fundSnapshotService.findLastActualHistorySnapshot()
        val transactions = transactionService.findTransactionsOrdered(fundSnapshot?.date ?: MIN_DATE)
        if (transactions.isEmpty()) {
            return
        }
        var fixationDate = fundSnapshot?.date ?: transactions.minOf { it.date }
        val fund = fundSnapshot?.fund ?: Fund()

        for (transaction in transactions) {

            val snapshotDate = transaction.date.withDayOfMonth(1)
            if (snapshotDate > fixationDate && fund.isNotEmpty()) {
                fixationDate = snapshotDate
                fundSnapshotService.saveHistorySnapshot(fixationDate, fund)
            }

            val allocationQueue = fund.get(transaction.account, transaction.amount.currency)

            if (transaction.direction == Direction.IN) {
                allocationQueue.add(transaction.id!!, transaction.amount)
                continue
            }

            var outFlowAmount = transaction.amount
            while (outFlowAmount.value > 0) {
                val nextAllocation = allocationQueue.removeFirstOrNull() ?: throw IllegalStateException("No budget for transaction ${transaction.id}")
                val relationAmount = if (nextAllocation.amount <= outFlowAmount) {
                    nextAllocation.amount
                } else {
                    outFlowAmount
                }

                relationService.saveInToOutRelation(
                    date = transaction.date,
                    from = nextAllocation.transaction,
                    to = transaction.id!!,
                    amount = relationAmount
                )

                outFlowAmount -= relationAmount
                nextAllocation.amount = nextAllocation.amount - relationAmount
                if (nextAllocation.amount.value > 0) {
                    allocationQueue.addFirst(nextAllocation)
                }
            }

            if (allocationQueue.isEmpty()) {
                fund.remove(transaction.account, transaction.amount.currency)
            }

        }

        fundSnapshotService.currentSnapshotActual(transactions.last().date, fund)

    }

    fun loadGraphRecursively(transactions: List<String>): Pair<List<Transaction>,List<Relation>> {
        val resultTransactions = transactions.toMutableSet()
        val resultRelations = mutableListOf<Relation>()
        val nextTransaction = transactions.toMutableSet()
        while (nextTransaction.isNotEmpty()) {
            relationService.findInboundRelations(nextTransaction)
                .also { nextTransaction.clear() }
                .onEach {
                    resultRelations.add(it)
                    if (it.from !in resultTransactions) {
                        resultTransactions.add(it.from)
                        nextTransaction.add(it.from)
                    }
                }
        }

        return Pair(
            transactionService.findTransactions(resultTransactions.toList()),
            resultRelations
        )
    }

    // greater or equal from and less than to
    // maybe load expenses with incomes
    fun loadFlows(from: LocalDate, to: LocalDate, targetCurrency: String): FlowsRecord {
        val (transactions, relations) = transactionService.findTransactions(from, to)
            .map { it.id!! }
            .let { loadGraphRecursively(it) }
        val nodeIndex = transactions.map { FlowNode(it) }.associateBy { it.transaction.id!! }

        relations.onEach {
            val nodeFrom = nodeIndex[it.from]!!
            val nodeTo = nodeIndex[it.to]!!
            val rate = if (it.exchange) {
                BigDecimal.ONE.divide(it.rate(), 10, RoundingMode.HALF_UP)
            } else {
                it.amount().toBigDecimal() / nodeTo.transaction.amount.toBigDecimal()
            }
            val edge = FlowEdge(rate, nodeFrom)
            nodeTo.parents.add(edge)
        }

        val incomes = mutableListOf<FlowRecord>()
        val expenses = mutableListOf<FlowRecord>()
        for (transaction in transactions) {
            if (transaction.date < from || transaction.date >= to) {
                continue
            }

            val incomeCategory = transaction.incomeCategory
            val expenseCategory = transaction.expenseCategory
            if (incomeCategory == null && expenseCategory == null) {
                continue
            }

            if (transaction.direction == Direction.IN) {
                val rate = exchangeRateService.rate(transaction.date, transaction.amount.currency, targetCurrency)
                val targetAmount = transaction.amount.toBigDecimal() * rate
                incomes.add(FlowRecord(transaction.date, Amount(targetAmount.toAmountValue(), targetCurrency), incomeCategory ?: expenseCategory!!))
                continue
            }

            val root = nodeIndex[transaction.id!!]!!
            root.markIfContains(targetCurrency)
            val targetAmount = root.resolve(root.transaction.amount.toBigDecimal(), targetCurrency)
            expenses.add(FlowRecord(transaction.date, Amount(targetAmount.toAmountValue(), targetCurrency), expenseCategory ?: incomeCategory!!))

        }

        return FlowsRecord(incomes, expenses)
    }

    private fun FlowNode.markIfContains(targetCurrency: String): Boolean {
        if (transaction.incomeCategory == null && transaction.expenseCategory == null && parents.isEmpty()) {
            throw IllegalStateException("Not enough relations for loading funds")
        }

        if (transaction.amount.currency == targetCurrency) {
            return false
        }
        necessaryVisitAncestor = parents.map { it.source.transaction.amount.currency == targetCurrency || it.source.markIfContains(targetCurrency) }.any { it }
        return necessaryVisitAncestor
    }

    private fun FlowNode.resolve(value: BigDecimal, targetCurrency: String): BigDecimal {
        if (!necessaryVisitAncestor) {
            val rate = exchangeRateService.rate(transaction.date, transaction.amount.currency, targetCurrency)
            return value * rate
        }

        return parents.sumOf { it.source.resolve(value * it.rate, targetCurrency) }
    }

    private companion object {
        val MIN_DATE: LocalDate = LocalDate.of(2000,1,1)
    }
    
}

class FlowNode(
    val transaction: Transaction,
    val parents: MutableList<FlowEdge> = mutableListOf(),
    var necessaryVisitAncestor: Boolean = false, // node is not target currency, but it is some of the parent
)

class FlowEdge(
    val rate: BigDecimal,
    val source: FlowNode,
)
