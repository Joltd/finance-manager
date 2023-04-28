package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.document.service.DocumentService
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.AccountService
import com.evgenltd.financemanager.transaction.entity.*
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
        .map { FundSnapshotRecord(
            id = it.id!!,
            date = it.date,
            type = it.type,
            accounts = emptyList()
        ) }
        .sortedByDescending { it.date }

    fun byId(id: String): FundSnapshotRecord {
        val fundSnapshot = fundSnapshotRepository.find(id)
        val fund = fundSnapshot.fund
        val transactionIds = fund.values.flatten().map { it.transaction }.distinct()
        val transactionIndex = transactionService.findTransactions(transactionIds).associateBy { it.id!! }
        val documentIds = transactionIndex.values.map { it.document }.distinct()
        val documentIndex = documentService.list(documentIds).associateBy { it.value.id()!! }
        val accountIndex = accountService.listReference().associateBy { it.id }

        val accounts = fund
            .entries
            .groupingBy { accountIndex.reference(it.key) }
            .fold(listOf<AllocationQueueRecord>()) { accumulator, element ->
                accumulator + element.value.toRecord(element.key, transactionIndex, documentIndex).let { listOf(it) }
            }
            .map { FundSnapshotAccountRecord(it.key, it.value.sortedBy { it.currency }) }
            .sortedBy { it.account.name }

        return FundSnapshotRecord(
            id = fundSnapshot.id!!,
            date = fundSnapshot.date,
            type = fundSnapshot.type,
            accounts = accounts
        )
    }

    fun findLastActualHistorySnapshot(): FundSnapshot? = fundSnapshotRepository.findFirstByTypeOrderByDateDesc(FundSnapshotType.HISTORY)

    fun findLastActualHistorySnapshot(date: LocalDate): FundSnapshot? =
        fundSnapshotRepository.findFirstByDateLessThanAndTypeOrderByDateDesc(date, FundSnapshotType.HISTORY)

    @Transactional
    fun deleteNotActualSnapshots(date: LocalDate) {
        fundSnapshotRepository.deleteByDateGreaterThanEqualAndType(date, FundSnapshotType.HISTORY)
    }

    @Transactional
    fun saveHistorySnapshot(date: LocalDate, fund: Fund) {
        val fundSnapshot = FundSnapshot(null, date, FundSnapshotType.HISTORY, fund)
        fundSnapshotRepository.save(fundSnapshot)
        currentSnapshotRebuild(date, fund)
    }

    @Transactional
    fun currentSnapshotOutdated(date: LocalDate) {
        val fundSnapshot = findCurrentSnapshot()
        fundSnapshot.date = date
        fundSnapshot.status = FundGraphStatus.OUTDATED
        fundSnapshotRepository.save(fundSnapshot)
    }

    private fun currentSnapshotRebuild(date: LocalDate, fund: Fund) {
        val fundSnapshot = findCurrentSnapshot()
        fundSnapshot.date = date
        fundSnapshot.status = FundGraphStatus.REBUILD
        fundSnapshot.fund = fund
        fundSnapshotRepository.save(fundSnapshot)
    }

    @Transactional
    fun currentSnapshotActual(date: LocalDate, fund: Fund) {
        val fundSnapshot = findCurrentSnapshot()
        fundSnapshot.date = date
        fundSnapshot.status = FundGraphStatus.ACTUAL
        fundSnapshot.fund = fund
        fundSnapshotRepository.save(fundSnapshot)
    }

    fun findCurrentSnapshot(): FundSnapshot = fundSnapshotRepository.findByType(FundSnapshotType.CURRENT)
        ?: FundSnapshot(null, LocalDate.now(), FundSnapshotType.CURRENT, Fund(), FundGraphStatus.OUTDATED)
            .also { fundSnapshotRepository.save(it) }

    private fun Map<String,Reference>.reference(key: String) = Fund.account(key)
        .let { get(it) ?: Reference(it, "Unknown", false) }

    private fun AllocationQueue.toRecord(
        key: String,
        transactionIndex: Map<String,Transaction>,
        documentIndex: Map<String,DocumentTypedRecord>
    ) = AllocationQueueRecord(
        currency = Fund.currency(key),
        allocations = map { allocation ->
            val transaction = transactionIndex[allocation.transaction]!!
            val document = documentIndex[transaction.document]!!
            val weight = allocation.amount.toBigDecimal() / transaction.amount.toBigDecimal() * BigDecimal(100)
            AllocationRecord(document, allocation.amount, weight.toInt())
        }
    )

}