package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.ExpenseCategoryService
import com.evgenltd.financemanager.reference.service.IncomeCategoryService
import com.evgenltd.financemanager.report.record.FlowGraphChartRecord
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.Relation
import com.evgenltd.financemanager.transaction.entity.Transaction
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

    fun load(id: String): FlowGraphChartRecord {

        val incomeIndex = incomeCategoryService.listReference().associateBy { it.id }
        val expenseIndex = expenseCategoryService.listReference().associateBy { it.id }

        val root = transactionService.findById(id) ?: throw IllegalArgumentException("Transaction $id not found")

        val isExchange = root.expenseCategory == null && root.incomeCategory == null
        if (root.direction == Direction.IN && !isExchange) {
            return FlowGraphChartRecord(emptyList(), emptyList())
        }

        val transactions = mutableListOf(root)
        val relations = mutableListOf<Relation>()

        if (root.direction == Direction.OUT && isExchange) {
            loadRelatedExchangeTransaction(root, transactions, relations)
        }

        loadPreviousTransactionsRecursively(id, transactions, relations)

        val result = FlowGraphChartRecord(
            nodes = transactions.distinctBy { it.id }.map { it.toNode(incomeIndex, expenseIndex) },
            links = relations.distinctBy { it.id }.map { it.toLink()}
        )

        return result.mergeExchanges().mergerTransfers()
    }

    private fun loadRelatedExchangeTransaction(root: Transaction, transactions: MutableList<Transaction>, relations: MutableList<Relation>) {
        val nextRelations = relationService.findOutboundRelations(listOf(root.id!!))
            .also { relations.addAll(it) }
        transactionService.findTransactions(nextRelations.map { it.to })
            .also { transactions.addAll(it) }
    }

    private fun loadPreviousTransactionsRecursively(id: String, transactions: MutableList<Transaction>, relations: MutableList<Relation>) {
        var prevTransactionsIds = listOf(id)
        while (true) {
            val prevRelations = relationService.findInboundRelations(prevTransactionsIds)
            if (prevRelations.isEmpty()) {
                break
            }
            relations.addAll(prevRelations)
            val prevTransactions = transactionService.findTransactions(prevRelations.map { it.from })
            transactions.addAll(prevTransactions)
            prevTransactionsIds = prevTransactions.map { it.id!! }
        }
    }

    private fun FlowGraphChartRecord.mergeExchanges(): FlowGraphChartRecord {

        val exchangeLinks = links.filter { it.exchange }
        val exchangeLinkTransactions = exchangeLinks.flatMap { listOf(it.source, it.target) }.toSet()
        val transactionIndex = nodes.filter { it.id in exchangeLinkTransactions }.associateBy { it.id }

        val oldToMergedIndex = mutableMapOf<String,String>()
        val mergedNodes = exchangeLinks.map {
            val mergedNode = it.merge(transactionIndex)
            oldToMergedIndex[it.source] = mergedNode.id
            oldToMergedIndex[it.target] = mergedNode.id
            mergedNode
        }

        return FlowGraphChartRecord(
            nodes = nodes.filter { it.id !in exchangeLinkTransactions } + mergedNodes,
            links = links.filter { !it.exchange }
                .onEach {
                    it.source = oldToMergedIndex[it.source] ?: it.source
                    it.target = oldToMergedIndex[it.target] ?: it.target
                }
        )
    }

    private fun FlowGraphChartRecord.mergerTransfers(): FlowGraphChartRecord {
        val mutableNodes = nodes.toMutableList()
        val mutableLinks = links.toMutableList()

        val iterator = mutableNodes.iterator()
        while (iterator.hasNext()) {
            val node = iterator.next()
            if (node.rate?.compareTo(BigDecimal.ONE) != 0) {
                continue
            }

            val inboundLinks = mutableLinks.filter { it.target == node.id }
            if (inboundLinks.size > 1) {
                continue
            }

            val inboundLink = inboundLinks.first()
            iterator.remove()
            mutableLinks.remove(inboundLink)

            mutableLinks.filter { it.source == node.id }
                .forEach { it.source = inboundLink.source }
        }

        return FlowGraphChartRecord(
            nodes = mutableNodes.toList(),
            links = mutableLinks.toList()
        )
    }

    private fun Transaction.toNode(incomeIndex: Map<String, Reference>, expenseIndex: Map<String, Reference>): FlowGraphChartRecord.Node = FlowGraphChartRecord.Node(
        id = id!!,
        direction = when (direction) {
            Direction.IN -> FlowGraphChartRecord.Type.IN
            Direction.OUT -> FlowGraphChartRecord.Type.OUT
        },
        date = date,
        amount = amount,
        category = if (incomeCategory != null) {
            incomeIndex[incomeCategory] ?: emptyReference(incomeCategory!!)
        } else if (expenseCategory != null) {
            expenseIndex[expenseCategory] ?: emptyReference(expenseCategory!!)
        } else {
            null
        }
    )

    private fun emptyReference(id: String) = Reference(id, "Unknown", false)

    private fun Relation.toLink(): FlowGraphChartRecord.Link = FlowGraphChartRecord.Link(
        source = from,
        target = to,
        date = date,
        exchange = exchange,
        amount = amount,
        rate = rate
    )

    private fun FlowGraphChartRecord.Link.merge(transactionIndex: Map<String,FlowGraphChartRecord.Node>): FlowGraphChartRecord.Node = FlowGraphChartRecord.Node(
        id = "${source}-${target}",
        direction = FlowGraphChartRecord.Type.EXCHANGE,
        date = date,
        amountFrom = transactionIndex[source]?.amount,
        amountTo = transactionIndex[target]?.amount,
        rate = rate
    )

}