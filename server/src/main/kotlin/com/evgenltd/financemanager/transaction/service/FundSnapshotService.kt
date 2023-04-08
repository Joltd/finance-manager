package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.transaction.entity.Fund
import com.evgenltd.financemanager.transaction.entity.FundSnapshot
import com.evgenltd.financemanager.transaction.entity.FundSnapshotType
import com.evgenltd.financemanager.transaction.repository.FundSnapshotRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class FundSnapshotService(
    private val fundSnapshotRepository: FundSnapshotRepository
) {

    fun findLastActualHistorySnapshot(): FundSnapshot? = fundSnapshotRepository.findFirstByTypeOrderByDateDesc(FundSnapshotType.HISTORY)

    fun deleteNotActualHistorySnapshots(date: LocalDate) {
        fundSnapshotRepository.deleteByDateGreaterThanEqualAndType(date, FundSnapshotType.HISTORY)
    }

    fun saveHistorySnapshot(date: LocalDate, fund: Fund) {
        val fundSnapshot = FundSnapshot(null, date, FundSnapshotType.HISTORY, fund)
        fundSnapshotRepository.save(fundSnapshot)
    }

    fun saveCurrentSnapshot(date: LocalDate, fund: Fund) {
        val fundSnapshot = fundSnapshotRepository.findByType(FundSnapshotType.CURRENT)
            ?: FundSnapshot(null, date, FundSnapshotType.CURRENT, fund)
        fundSnapshot.date = date
        fundSnapshot.fund = fund
        fundSnapshotRepository.save(fundSnapshot)
    }

}