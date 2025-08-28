package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.account.converter.BalanceConverter
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.record.BalanceCommonRecord
import com.evgenltd.financemanager.account.record.BalanceRecord
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.repository.isNotZero
import org.springframework.stereotype.Service

@Service
@SkipLogging
class BalanceService(
    private val balanceRepository: BalanceRepository,
    private val balanceConverter: BalanceConverter,
) : Loggable() {

    fun list(): List<BalanceRecord> = balanceRepository.findAll()
        .map { balanceConverter.toRecord(it) }

    fun listCommon(): List<BalanceCommonRecord> {
        val balances = balanceRepository.findAll(Balance::amount.isNotZero())

        val currencies = balances.map { it.amount.currency }.distinct()

        return balances.map {
            balanceConverter.toCommonRecord(it)
        }
    }

}