package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.service.ReferenceService
import com.evgenltd.financemanager.report.record.AccountBalanceRecord
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.transaction.entity.*
import com.evgenltd.financemanager.transaction.service.FundSnapshotService
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
class DashboardService(
    private val referenceService: ReferenceService,
    private val fundSnapshotService: FundSnapshotService
) {

    fun load(): DashboardRecord = DashboardRecord(loadAccountBalances())

    private fun loadAccountBalances(): List<AccountBalanceRecord> {
        val accountIndex = referenceService.accountIndex()
        val fundSnapshot = fundSnapshotService.findCurrentSnapshot()
        return fundSnapshot.fund
            .entries
            .map { it.key to it.value.toBalance() }
            .groupBy { Fund.account(it.first) }
            .map {
                val account = accountIndex[it.key]
                AccountBalanceRecord(
                        account?.id,
                        account?.name ?: "Unknown",
                        account?.actualOn
                                ?.let { actualOn -> ChronoUnit.DAYS.between(actualOn, LocalDate.now()) },
                        it.value.map { it.second }
                )
            }
    }

    private fun AllocationQueue.toBalance(): Amount = map { it.amount }.reduce { acc, amount -> acc + amount }

}