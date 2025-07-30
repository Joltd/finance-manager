package com.evgenltd.financemanager.turnover.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.operation.service.signedAmount
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.turnover.entity.Balance
import com.evgenltd.financemanager.turnover.entity.Turnover
import com.evgenltd.financemanager.turnover.repository.BalanceRepository
import com.evgenltd.financemanager.turnover.repository.TurnoverRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.*

@Service
class BalanceActionService(
    private val balanceRepository: BalanceRepository,
    private val turnoverRepository: TurnoverRepository,
    private val transactionRepository: TransactionRepository,
    private val balanceEventService: BalanceEventService,
) : Loggable() {

    @Transactional
    fun invalidateBalance(account: Account, currency: String, date: LocalDate) {
        val balance = balanceRepository.findAndLock(account, currency)
        if (balance == null) {
            Balance(
                account = account,
                amount = Amount(0, currency),
                date = date,
                nextDate = date,
            ).let { balanceRepository.save(it) }
        } else if (balance.nextDate == null || date.isBefore(balance.nextDate)) {
            balance.nextDate = date
        }
    }

    @Transactional
    fun lockBalance(id: UUID): LocalDate? {
        val balance = balanceRepository.findAndLock(id)
        if (balance == null) {
            log.warn("Balance $id not found")
            return null
        }

        val date = balance.nextDate
        if (balance.progress || date == null) {
            log.warn("Balance $id already in progress or not prepared for update")
            return null
        }

        balance.progress = true
        balance.nextDate = null
        balanceRepository.saveAndFlush(balance)

        balanceEventService.balanceProgress(id, true)

        return date
    }

    @Transactional
    fun unlockBalance(id: UUID) {
        val balance = balanceRepository.findAndLock(id)
        if (balance == null) {
            log.warn("Balance $id not found")
            return
        }

        if (!balance.progress) {
            log.warn("Balance already not in progress")
            return
        }

        balance.progress = false

        balanceEventService.balanceProgress(id, false)
    }

    @Transactional
    fun updateBalance(balanceId: UUID, date: LocalDate) {
        val balance = balanceRepository.find(balanceId)

        val account = balance.account
        val currency = balance.amount.currency
        val updateFrom = date.withDayOfMonth(1)

        turnoverRepository.deleteByAccountAndAmountCurrencyAndDateGreaterThanEqual(account, currency, updateFrom)

        var cumulativeAmount = turnoverRepository.findFirstByAccountAndAmountCurrencyAndDateLessThanOrderByDateDesc(account, currency, updateFrom)
            ?.cumulativeAmount
            ?: Amount(0, currency)

        transactionRepository.findByAccountAndAmountCurrencyAndDateGreaterThanEqual(account, currency, updateFrom)
            .groupingBy { it.date.withDayOfMonth(1) }
            .aggregate { key, accumulator: Amount?, element, first ->
                element.signedAmount() + accumulator
            }
            .map { it }
            .sortedBy { it.key }
            .map {
                cumulativeAmount += it.value
                Turnover(
                    id = null,
                    date = it.key,
                    account = account,
                    amount = it.value,
                    cumulativeAmount = cumulativeAmount
                )
            }
            .let { turnoverRepository.saveAll(it) }

        balance.amount = cumulativeAmount
        balance.date = LocalDate.now()

        balanceEventService.balance(balanceId)
    }
}