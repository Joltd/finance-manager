package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.account.converter.BalanceConverter
import com.evgenltd.financemanager.account.record.BalanceRecord
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import org.springframework.stereotype.Service

@Service
@SkipLogging
class BalanceService(
    private val balanceRepository: BalanceRepository,
    private val balanceConverter: BalanceConverter,
) : Loggable() {

    fun list(): List<BalanceRecord> = balanceRepository.findAll()
        .map { balanceConverter.toRecord(it) }

}