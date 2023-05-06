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
import com.evgenltd.financemanager.transaction.record.*
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
    private val exchangeRateService: ExchangeRateService,
    private val graphStateService: GraphStateService
) : Loggable() {

    @EventListener
    @Transactional
    fun onResetGraph(event: ResetGraphEvent) {
        resetGraph(event.date)
    }

    @Transactional
    fun resetGraph(date: LocalDate) {
        fundSnapshotService.deleteNotActualSnapshots(date)
        val fundSnapshot = fundSnapshotService.findLastActualSnapshot()
        val fixationDate = fundSnapshot?.date ?: MIN_DATE
        relationService.deleteNotActual(fixationDate)
        graphStateService.graphOutdated(fixationDate)
    }

    @EventListener
    @Transactional
    fun onRebuildGraph(event: RebuildGraphEvent) {
        rebuildGraph()
    }

    @Transactional
    @Async
    fun startRebuildGraph() {
        rebuildGraph()
    }

    private fun rebuildGraph() {
        try {
            rebuildGraphImpl()
        } catch (e: Exception) {
            graphStateService.graphError(Fund(), e.message ?: "Rebuilding graph error")
            log.error("Error while rebuilding graph", e)
        }
    }

    private fun rebuildGraphImpl() {
        val fundSnapshot = fundSnapshotService.findLastActualSnapshot()
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
                fundSnapshotService.saveSnapshot(fixationDate, fund)
                graphStateService.graphRebuild(fixationDate)
            }

            val allocationQueue = fund.get(transaction.account, transaction.amount.currency)

            if (transaction.direction == Direction.IN) {
                allocationQueue.add(transaction.id!!, transaction.amount)
                continue
            }

            var outFlowAmount = transaction.amount
            while (outFlowAmount.value > 0) {
                val nextAllocation = allocationQueue.removeFirstOrNull()
                if (nextAllocation == null) {
                    graphStateService.graphError(fund, "No budget for transaction ${transaction.date} ${transaction.direction} ${transaction.amount}")
                    return
                }
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

        graphStateService.graphActual(transactions.last().date, fund)

    }

    //

    fun loadFlows(from: LocalDate, to: LocalDate, targetCurrency: String): Pair<List<FlowRecord>,List<FlowRecord>> {
        val transactions = transactionService.findTransactions(from, to)

        val incomes = mutableListOf<FlowRecord>()
        val expenses = mutableListOf<FlowRecord>()

        for (transaction in transactions) {
            val category = transaction.incomeCategory ?: transaction.expenseCategory ?: continue

            if (transaction.direction == Direction.IN) {
                val rate = exchangeRateService.rate(transaction.date, transaction.amount.currency, targetCurrency)
                val targetAmount = transaction.amount.toBigDecimal() * rate
                incomes.add(FlowRecord(transaction.date, Amount(targetAmount.toAmountValue(), targetCurrency), category))
            } else if (transaction.direction == Direction.OUT) {
                val graph = loadFlowGraph(transaction.id!!, targetCurrency)
                expenses.add(FlowRecord(transaction.date, graph.targetAmount, category))
            }
        }

        return incomes to expenses
    }

    fun loadFlowGraph(transactionId: String, targetCurrency: String): FlowGraph {
        val (transactions, relations) = loadRawGraph(listOf(transactionId))
        val graph = prepareGraph(transactions, relations)
        val root = graph[transactionId] ?: throw IllegalStateException("Graph does not contains transaction $transactionId")
        root.markIfContains(targetCurrency)
        val targetAmount = root.resolve(root.transaction.amount.toBigDecimal(), targetCurrency)
        return FlowGraph(
            nodes = graph.values.map { it.toFlowGraphNode() },
            edges = relations.map { FlowGraphEdge(it) },
            targetAmount = Amount(targetAmount.toAmountValue(), targetCurrency)
        )
    }

    private fun loadRawGraph(transactions: List<String>): Pair<List<Transaction>, List<Relation>> {
        val resultTransactionIds = transactions.toMutableSet()
        val resultRelations = mutableListOf<Relation>()
        val nextTransaction = transactions.toMutableSet()
        while (nextTransaction.isNotEmpty()) {
            relationService.findInboundRelations(nextTransaction)
                .also { nextTransaction.clear() }
                .onEach {
                    resultRelations.add(it)
                    if (it.from !in resultTransactionIds) {
                        resultTransactionIds.add(it.from)
                        nextTransaction.add(it.from)
                    }
                }
        }

        val resultTransactions = transactionService.findTransactions(resultTransactionIds.toList())

        return resultTransactions to resultRelations
    }

    private fun prepareGraph(transactions: List<Transaction>, relations: List<Relation>): Map<String, InternalFlowGraphNode> {
        val nodeIndex = transactions.map { InternalFlowGraphNode(it) }.associateBy { it.transaction.id!! }

        relations.onEach {
            val nodeFrom = nodeIndex[it.from]!!
            val nodeTo = nodeIndex[it.to]!!
            val rate = if (it.exchange) {
                BigDecimal.ONE.divide(it.rate(), 10, RoundingMode.HALF_UP)
            } else {
                it.amount().toBigDecimal() / nodeTo.transaction.amount.toBigDecimal()
            }
            val edge = InternalFlowGraphEdge(it, rate, nodeFrom)
            nodeTo.parents.add(edge)
        }

        return nodeIndex
    }

    private fun InternalFlowGraphNode.markIfContains(targetCurrency: String): Boolean {
        if (transaction.incomeCategory == null && transaction.expenseCategory == null && parents.isEmpty()) {
            throw IllegalStateException("Not enough relations for loading funds")
        }

        if (transaction.amount.currency == targetCurrency) {
            return false
        }

        if (necessaryVisitAncestor) {
            return true
        }

        necessaryVisitAncestor = parents.map { it.source.transaction.amount.currency == targetCurrency || it.source.markIfContains(targetCurrency) }.any { it }
        return necessaryVisitAncestor
    }

    private fun InternalFlowGraphNode.resolve(value: BigDecimal, targetCurrency: String): BigDecimal {
        targetAmount += value
        return if (!necessaryVisitAncestor) {
            val rate = exchangeRateService.rate(transaction.date, transaction.amount.currency, targetCurrency)
            value * rate
        } else {
            parents.sumOf { it.source.resolve(value * it.rate, targetCurrency) }
        }
    }

    private fun InternalFlowGraphNode.toFlowGraphNode(): FlowGraphNode = FlowGraphNode(
        transaction,
        if (targetAmount.signum() != 0) Amount(targetAmount.toAmountValue(), transaction.amount.currency)
        else null
    )

    private companion object {
        val MIN_DATE: LocalDate = LocalDate.of(2000,1,1)
    }
    
}

class InternalFlowGraphNode(
    val transaction: Transaction,
    val parents: MutableList<InternalFlowGraphEdge> = mutableListOf(),
    var necessaryVisitAncestor: Boolean = false, // node is not target currency, but it is some of the parent
    var targetAmount: BigDecimal = BigDecimal.ZERO,
)

class InternalFlowGraphEdge(
    val relation: Relation,
    val rate: BigDecimal,
    val source: InternalFlowGraphNode,
)
