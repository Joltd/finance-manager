package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.account.repository.BalanceRepository
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service

@Service
class BalanceScheduler(
    private val balanceRepository: BalanceRepository,
    private val balanceProcessService: BalanceProcessService,
) {

    @SkipLogging
    @Scheduled(fixedDelay = 1000)
    fun updateBalances() {
        val balances = balanceRepository.findByNextDateIsNotNullAndProgressIsFalse()
        for (balance in balances) {
            balanceProcessService.updateBalance(balance.id!!)
        }
    }

}