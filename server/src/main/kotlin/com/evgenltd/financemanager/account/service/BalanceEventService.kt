package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.account.converter.BalanceConverter
import com.evgenltd.financemanager.account.record.BalanceRecord
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.common.component.SseEventMapping
import org.springframework.stereotype.Service
import java.util.*

@Service
class BalanceEventService(
    private val balanceRepository: BalanceRepository,
    private val balanceConverter: BalanceConverter,
) {

    @SseEventMapping("/api/v1/balance")
    fun balance(accountId: UUID, currency: String): BalanceRecord? =
        balanceRepository.findByAccountIdAndAmountCurrency(accountId, currency)
            ?.let { balanceConverter.toRecord(it) }

}