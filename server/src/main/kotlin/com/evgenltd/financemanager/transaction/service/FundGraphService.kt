package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.Fund
import com.evgenltd.financemanager.transaction.event.RebuildGraphEvent
import com.evgenltd.financemanager.transaction.event.ResetGraphEvent
import com.evgenltd.financemanager.transaction.repository.TransactionRepository
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class FundGraphService(
    private val transactionRepository: TransactionRepository,
    private val relationService: RelationService,
    private val fundSnapshotService: FundSnapshotService
) {

    @EventListener
    fun onResetGraph(event: ResetGraphEvent) {
        resetGraph(event.date)
    }

    fun resetGraph(date: LocalDate) {
        fundSnapshotService.deleteNotActualHistorySnapshots(date)
        val fundSnapshot = fundSnapshotService.findLastActualHistorySnapshot()
        val fixationDate = fundSnapshot?.date ?: LocalDate.MIN
        relationService.deleteNotActual(fixationDate)
    }

    @EventListener
    fun onRebuildGraph(event: RebuildGraphEvent) {
        rebuildGraph()
    }

    fun rebuildGraph() {
        val fundSnapshot = fundSnapshotService.findLastActualHistorySnapshot()
        var fixationDate = fundSnapshot?.date ?: LocalDate.MIN
        val fund = fundSnapshot?.fund ?: Fund()
        val transactions = transactionRepository.findByDateGreaterThanOrderByDateAscDirectionAsc(fixationDate)
        if (transactions.isEmpty()) {
            return
        }

        for (transaction in transactions) {

            val snapshotDate = transaction.date.withDayOfMonth(1)
            if (snapshotDate > fixationDate) {
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
                val nextAllocation = allocationQueue.removeFirstOrNull() ?: throw IllegalStateException("No budget for transaction $transaction")
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

        }

        fundSnapshotService.saveCurrentSnapshot(transactions.last().date, fund)

    }

}