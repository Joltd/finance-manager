package com.evgenltd.financemanager.turnover.service

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.turnover.converter.BalanceConverter
import com.evgenltd.financemanager.turnover.record.BalanceRecord
import com.evgenltd.financemanager.turnover.repository.BalanceRepository
import org.springframework.stereotype.Service

@Service
class BalanceService(
    private val balanceRepository: BalanceRepository,
    private val balanceConverter: BalanceConverter,
) : Loggable() {

    fun list(): List<BalanceRecord> = balanceRepository.findAll()
        .map { balanceConverter.toRecord(it) }

}