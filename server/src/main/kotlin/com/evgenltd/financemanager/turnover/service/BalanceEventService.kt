package com.evgenltd.financemanager.turnover.service

import com.evgenltd.financemanager.common.component.Patch
import com.evgenltd.financemanager.common.component.SseEventMapping
import com.evgenltd.financemanager.common.component.patch
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.turnover.converter.BalanceConverter
import com.evgenltd.financemanager.turnover.repository.BalanceRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class BalanceEventService(
    private val balanceRepository: BalanceRepository,
    private val balanceConverter: BalanceConverter,
) {

    @SseEventMapping("/balance")
    fun balanceProgress(id: UUID, progress: Boolean): Patch = patch(progress, "/id=$id/progress")

    @SseEventMapping("/balance")
    fun balance(id: UUID): Patch = balanceRepository.find(id)
        .let { balanceConverter.toRecord(it) }
        .let { patch(it, "/id=$id") }

}