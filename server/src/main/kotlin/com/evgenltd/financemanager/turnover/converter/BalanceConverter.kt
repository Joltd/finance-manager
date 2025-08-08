package com.evgenltd.financemanager.turnover.converter

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.turnover.entity.Balance
import com.evgenltd.financemanager.turnover.record.BalanceRecord
import org.springframework.stereotype.Service

@Service
class BalanceConverter(
    private val accountConverter: AccountConverter,
) {
    
    fun toRecord(balance: Balance): BalanceRecord = BalanceRecord(
        id = balance.id!!,
        account = accountConverter.toRecord(balance.account),
        amount = balance.amount,
        date = balance.date,
        progress = balance.progress,
    )
    
}