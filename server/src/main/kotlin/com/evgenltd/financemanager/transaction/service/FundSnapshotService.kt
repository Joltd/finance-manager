package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.document.service.DocumentService
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.AccountService
import com.evgenltd.financemanager.transaction.entity.AllocationQueue
import com.evgenltd.financemanager.transaction.entity.Fund
import com.evgenltd.financemanager.transaction.entity.FundSnapshot
import com.evgenltd.financemanager.transaction.entity.Transaction
import com.evgenltd.financemanager.transaction.record.AllocationQueueRecord
import com.evgenltd.financemanager.transaction.record.AllocationRecord
import com.evgenltd.financemanager.transaction.record.FundSnapshotAccountRecord
import com.evgenltd.financemanager.transaction.record.FundSnapshotRecord
import com.evgenltd.financemanager.transaction.repository.FundSnapshotRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

@Service
class FundSnapshotService(
    private val fundSnapshotRepository: FundSnapshotRepository,
    private val transactionService: TransactionService,
    private val documentService: DocumentService,
    private val accountService: AccountService
) {

    fun list(): List<FundSnapshotRecord> = fundSnapshotRepository.findAll()
        .map { it.toRecord() }
        .sortedByDescending { it.date }

    fun byId(id: String): FundSnapshotRecord {
        val fundSnapshot = fundSnapshotRepository.find(id)
        return FundSnapshotRecord(
            id = fundSnapshot.id!!,
            date = fundSnapshot.date,
            accounts = asAccounts(fundSnapshot.fund)
        )
    }

    fun asAccounts(fund: Fund): List<FundSnapshotAccountRecord> {
        val transactionIds = fund.values.flatten().map { it.transaction }.distinct()
        val transactionIndex = transactionService.findTransactions(transactionIds).associateBy { it.id!! }
        val documentIds = transactionIndex.values.map { it.document }.distinct()
        val documentIndex = documentService.list(documentIds).associateBy { it.value.id()!! }
        val accountIndex = accountService.listReference().associateBy { it.id }

        return fund
            .entries
            .groupingBy { accountIndex.reference(it.key) }
            .fold(listOf<AllocationQueueRecord>()) { accumulator, element ->
                accumulator + element.value.toRecord(element.key, transactionIndex, documentIndex).let { listOf(it) }
            }
            .map { FundSnapshotAccountRecord(it.key, it.value.sortedBy { it.amount.currency }) }
            .sortedBy { it.account.name }
    }

    fun findLastActualSnapshot(): FundSnapshot? = fundSnapshotRepository.findFirstByOrderByDateDesc()

    @Transactional
    fun deleteNotActualSnapshots(date: LocalDate) {
        fundSnapshotRepository.deleteByDateGreaterThanEqual(date)
    }

    @Transactional
    fun saveSnapshot(date: LocalDate, fund: Fund) {
        val fundSnapshot = FundSnapshot(null, date, fund)
        fundSnapshotRepository.save(fundSnapshot)
    }

    private fun FundSnapshot.toRecord() = FundSnapshotRecord(
        id = id!!,
        date = date,
        accounts = emptyList()
    )

    private fun Map<String,Reference>.reference(key: String) = Fund.account(key)
        .let { get(it) ?: Reference(it, "Unknown", false) }

    private fun AllocationQueue.toRecord(
        key: String,
        transactionIndex: Map<String, Transaction>,
        documentIndex: Map<String, DocumentTypedRecord>
    ) = AllocationQueueRecord(
        amount = map { it.amount }.fold(Amount(0, Fund.currency(key))) { acc, amount -> acc + amount },
        allocations = map { allocation ->
            val transaction = transactionIndex[allocation.transaction]!!
            val document = documentIndex[transaction.document]!!
            val weight = allocation.amount.toBigDecimal() / transaction.amount.toBigDecimal() * BigDecimal(100)
            AllocationRecord(document, allocation.amount, weight.toInt())
        }
    )

}