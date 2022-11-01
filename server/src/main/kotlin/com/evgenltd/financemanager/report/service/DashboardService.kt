package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.reference.entity.ExpenseCategory
import com.evgenltd.financemanager.reference.entity.IncomeCategory
import com.evgenltd.financemanager.reference.service.ReferenceService
import com.evgenltd.financemanager.report.record.*
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.ExpenseTransaction
import com.evgenltd.financemanager.transaction.entity.IncomeTransaction
import com.evgenltd.financemanager.transaction.repository.AccountTransactionRepository
import com.evgenltd.financemanager.transaction.repository.ExpenseTransactionRepository
import com.evgenltd.financemanager.transaction.repository.IncomeTransactionRepository
import com.evgenltd.financemanager.transaction.repository.TransactionRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
class DashboardService(
        private val referenceService: ReferenceService,
        private val accountTransactionRepository: AccountTransactionRepository
) {

    fun load(): DashboardRecord = DashboardRecord(loadAccountBalances())

    private fun loadAccountBalances(): List<AccountBalanceRecord> {
        val accountIndex = referenceService.accountIndex()
        return accountTransactionRepository.findByAccountNotNull()
                .groupBy { it.account }
                .map {
                    val account = accountIndex[it.key]
                    AccountBalanceRecord(
                            account?.id,
                            account?.name ?: "Unknown",
                            it.value.sumByCurrency()
                    )
                }
    }

    private fun List<AccountTransaction>.sumByCurrency(): List<Amount> = this.groupBy { it.amount.currency }
            .map { Amount(it.value.sum(), it.key) }
            .filter { it.value != 0L }

    private fun List<AccountTransaction>.sum() = sumOf {
        if (it.direction == Direction.IN) {
            it.amount.value
        } else {
            -it.amount.value
        }
    }
}