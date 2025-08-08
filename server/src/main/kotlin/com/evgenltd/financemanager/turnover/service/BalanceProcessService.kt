package com.evgenltd.financemanager.turnover.service

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.operation.record.OperationEvent
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.turnover.entity.Balance
import com.evgenltd.financemanager.turnover.repository.BalanceRepository
import com.evgenltd.financemanager.turnover.repository.TurnoverRepository
import jakarta.annotation.PostConstruct
import org.springframework.core.annotation.Order
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.event.TransactionalEventListener
import java.time.LocalDate
import java.util.*

@Service
class BalanceProcessService(
    private val balanceRepository: BalanceRepository,
    private val balanceActionService: BalanceActionService,
    private val turnoverRepository: TurnoverRepository,
) : Loggable() {

    @PostConstruct
    fun init() {
        if (balanceRepository.count() > 0L) {
            return
        }

        turnoverRepository.findByAccountType(AccountType.ACCOUNT)
            .sliceLast()
            .map {
                Balance(
                    id = null,
                    account = it.value.account,
                    amount = it.value.cumulativeAmount,
                    date = LocalDate.now(),
                )
            }
            .let { balanceRepository.saveAll(it) }
    }

    @TransactionalEventListener
    @Order(10)
    fun operationChanged(event: OperationEvent) {
        event.entries
            .asSequence()
            .flatMap { listOf(it.old, it.new) }
            .filterNotNull()
            .flatMap {
                listOf(
                    TransactionKey(it.date, it.accountFrom, it.amountFrom.currency),
                    TransactionKey(it.date, it.accountTo, it.amountTo.currency),
                )
            }
            .filter { it.account.type == AccountType.ACCOUNT }
            .distinct()
            .onEach {
                balanceActionService.invalidateBalance(
                    it.account,
                    it.currency,
                    it.date,
                )
            }
            .toList()
    }

    @Async
    fun updateBalance(id: UUID) {
        try {
            val date = balanceActionService.lockBalance(id) ?: return

            balanceActionService.updateBalance(id, date)
        } catch (e: Exception) {
            log.error("Unable to update balance $id", e)
        } finally {
            balanceActionService.unlockBalance(id)
        }
    }

    private data class TransactionKey(val date: LocalDate, val account: Account, val currency: String)

}