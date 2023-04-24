package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.transaction.entity.Fund
import com.evgenltd.financemanager.transaction.entity.FundGraphStatus
import com.evgenltd.financemanager.transaction.entity.FundSnapshot
import com.evgenltd.financemanager.transaction.entity.FundSnapshotType
import com.evgenltd.financemanager.transaction.repository.FundSnapshotRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class FundSnapshotService(
    private val fundSnapshotRepository: FundSnapshotRepository
) {

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

}