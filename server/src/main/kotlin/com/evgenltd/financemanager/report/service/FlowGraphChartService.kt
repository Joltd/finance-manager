package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.ExpenseCategoryService
import com.evgenltd.financemanager.reference.service.IncomeCategoryService
import com.evgenltd.financemanager.report.record.FlowGraphChartRecord
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.Relation
import com.evgenltd.financemanager.transaction.entity.Transaction
import com.evgenltd.financemanager.transaction.record.FlowGraphEdge
import com.evgenltd.financemanager.transaction.record.FlowGraphNode
import com.evgenltd.financemanager.transaction.service.FundGraphService
import com.evgenltd.financemanager.transaction.service.RelationService
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class FlowGraphChartService(
    private val transactionService: TransactionService,
    private val relationService: RelationService,
    private val fundGraphService: FundGraphService,
    private val incomeCategoryService: IncomeCategoryService,
    private val expenseCategoryService: ExpenseCategoryService
) {

    fun load(documentId: String): FlowGraphChartRecord {

        val transactions = transactionService.findByDocument(documentId)
        var transaction = transactions.firstOrNull() ?: throw IllegalArgumentException("Transactions for document $documentId not found")
        val hasExpense = transaction.expenseCategory != null
        val hasIncome = transaction.incomeCategory != null
        if (transaction.direction == Direction.IN && (hasExpense || hasIncome)) {
            return FlowGraphChartRecord(emptyList(), emptyList())
        }

        if (transaction.direction == Direction.OUT && !hasExpense && !hasIncome) {
            if (transactions.size < 2) {
                throw IllegalArgumentException("Exchange document does not have enough transactions")
            }
            transaction = transactions[1]
            if (transaction.direction != Direction.IN) {
                throw IllegalArgumentException("Second transaction in exchange document must be IN")
            }
        }

        val incomeIndex = incomeCategoryService.listReference().associateBy { it.id }
        val expenseIndex = expenseCategoryService.listReference().associateBy { it.id }

        val graph = fundGraphService.loadFlowGraph(transaction.id!!, "USD")

        return FlowGraphChartRecord(
            nodes = graph.nodes.map { it.toNode(incomeIndex, expenseIndex) },
            links = graph.edges.map { it.toLink()}
        )

    }

//    private fun FlowGraphChartRecord.mergeExchanges(): FlowGraphChartRecord {
//
//        val exchangeLinks = links.filter { it.exchange }
//        val exchangeLinkTransactions = exchangeLinks.flatMap { listOf(it.source, it.target) }.toSet()
//        val transactionIndex = nodes.filter { it.id in exchangeLinkTransactions }.associateBy { it.id }
//
//        val oldToMergedIndex = mutableMapOf<String,String>()
//        val mergedNodes = exchangeLinks.map {
//            val mergedNode = it.merge(transactionIndex)
//            oldToMergedIndex[it.source] = mergedNode.id
//            oldToMergedIndex[it.target] = mergedNode.id
//            mergedNode
//        }
//
//        return FlowGraphChartRecord(
//            nodes = nodes.filter { it.id !in exchangeLinkTransactions } + mergedNodes,
//            links = links.filter { !it.exchange }
//                .onEach {
//                    it.source = oldToMergedIndex[it.source] ?: it.source
//                    it.target = oldToMergedIndex[it.target] ?: it.target
//                }
//        )
//    }
//
//    private fun FlowGraphChartRecord.mergerTransfers(): FlowGraphChartRecord {
//        val mutableNodes = nodes.toMutableList()
//        val mutableLinks = links.toMutableList()
//
//        val iterator = mutableNodes.iterator()
//        while (iterator.hasNext()) {
//            val node = iterator.next()
//            if (node.rate?.compareTo(BigDecimal.ONE) != 0) {
//                continue
//            }
//
//            val inboundLinks = mutableLinks.filter { it.target == node.id }
//            if (inboundLinks.size > 1) {
//                continue
//            }
//
//            val inboundLink = inboundLinks.first()
//            iterator.remove()
//            mutableLinks.remove(inboundLink)
//
//            mutableLinks.filter { it.source == node.id }
//                .forEach { it.source = inboundLink.source }
//        }
//
//        return FlowGraphChartRecord(
//            nodes = mutableNodes.toList(),
//            links = mutableLinks.toList()
//        )
//    }

    private fun FlowGraphNode.toNode(incomeIndex: Map<String, Reference>, expenseIndex: Map<String, Reference>): FlowGraphChartRecord.Node = FlowGraphChartRecord.Node(
        id = transaction.id!!,
        direction = when (transaction.direction) {
            Direction.IN -> FlowGraphChartRecord.Type.IN
            Direction.OUT -> FlowGraphChartRecord.Type.OUT
        },
        date = transaction.date,
        amount = transaction.amount,
        category = if (transaction.incomeCategory != null) {
            incomeIndex[transaction.incomeCategory] ?: emptyReference(transaction.incomeCategory!!)
        } else if (transaction.expenseCategory != null) {
            expenseIndex[transaction.expenseCategory] ?: emptyReference(transaction.expenseCategory!!)
        } else {
            null
        },
        targetAmount = targetAmount
    )

    private fun emptyReference(id: String) = Reference(id, "Unknown", false)

    private fun FlowGraphEdge.toLink(): FlowGraphChartRecord.Link = FlowGraphChartRecord.Link(
        source = relation.from,
        target = relation.to,
        date = relation.date,
        exchange = relation.exchange,
        amount = relation.amount,
        rate = relation.rate
    )

//    private fun FlowGraphChartRecord.Link.merge(transactionIndex: Map<String,FlowGraphChartRecord.Node>): FlowGraphChartRecord.Node = FlowGraphChartRecord.Node(
//        id = "${source}-${target}",
//        direction = FlowGraphChartRecord.Type.EXCHANGE,
//        date = date,
//        amountFrom = transactionIndex[source]?.amount,
//        amountTo = transactionIndex[target]?.amount,
//        rate = rate
//    )

}