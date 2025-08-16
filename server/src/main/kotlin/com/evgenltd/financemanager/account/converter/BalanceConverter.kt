package com.evgenltd.financemanager.account.converter

import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.record.BalanceRecord
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