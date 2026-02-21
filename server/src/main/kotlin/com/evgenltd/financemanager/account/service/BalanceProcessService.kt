package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.record.BalanceCalculationCompleted
import com.evgenltd.financemanager.account.record.BalanceCalculationRequest
import com.evgenltd.financemanager.common.service.LockService
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.user.component.currentTenant
import com.evgenltd.financemanager.user.component.withRootTenant
import org.springframework.context.ApplicationEventPublisher
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

@Service
class BalanceProcessService(
    private val balanceActionService: BalanceActionService,
    private val lockService: LockService,
    private val publisher: ApplicationEventPublisher,
) : Loggable() {

    fun requestCalculateBalance(accountId: UUID, currency: String, date: LocalDate) {
        val tenant = currentTenant()
        if (tenant == null) {
            log.warn("Tenant is null, skip balance update for accountId: $accountId, currency: $currency")
            return
        }
        balanceActionService.calculationRequest(tenant, accountId, currency, date)
        publisher.publishEvent(BalanceCalculationRequest(accountId, currency))
    }

    @Async
    @EventListener
    fun requestCalculateBalance(event: BalanceCalculationRequest) {
        val accountId = event.accountId
        val currency = event.currency

        val locked = lockService.withTryLock("${Balance::class.simpleName}:$accountId:$currency") {
            val balance = balanceActionService.calculateBalance(accountId, currency)
            if (balance != null) {
                balanceActionService.calculationCompleted(balance.id, balance.calculationDate, balance.calculationVersion)
            }
        }
        if (locked) {
            publisher.publishEvent(BalanceCalculationCompleted(accountId, currency))
        }
    }

    @Scheduled(cron = "*/10 * * * * *")
    fun requestCalculateBalance() {
        balanceActionService.getBalancesForCalculation()
            .onEach {
                publisher.publishEvent(BalanceCalculationRequest(it.account.id!!, it.amount.currency))
            }
    }

}