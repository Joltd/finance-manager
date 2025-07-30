package com.evgenltd.financemanager.turnover.service

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.turnover.entity.Balance
import com.evgenltd.financemanager.turnover.record.InvalidateBalanceEvent
import com.evgenltd.financemanager.turnover.repository.BalanceRepository
import com.evgenltd.financemanager.turnover.repository.TurnoverRepository
import jakarta.annotation.PostConstruct
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
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

    @Async
    @EventListener
    fun invalidateBalanceListener(event: InvalidateBalanceEvent) {
        balanceActionService.invalidateBalance(event.account, event.currency, event.date)
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

}