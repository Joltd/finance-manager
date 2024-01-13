package com.evgenltd.financemanager.candy.converter

import com.evgenltd.financemanager.candy.entity.Candy
import com.evgenltd.financemanager.candy.record.CandyExpenseRecord
import org.springframework.stereotype.Service

@Service
class CandyConverter {

    fun toExpense(candy: Candy): CandyExpenseRecord = CandyExpenseRecord(
        id = candy.id,
        date = candy.date,
        amount = candy.amount,
        amountUsd = candy.amountUsd,
        comment = candy.comment,
    )

}