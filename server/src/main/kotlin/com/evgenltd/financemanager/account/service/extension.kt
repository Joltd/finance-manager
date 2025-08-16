package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.account.entity.Turnover
import com.evgenltd.financemanager.account.record.TurnoverKey

fun Turnover.toKey(): TurnoverKey = TurnoverKey(account.id!!, amount.currency)

fun List<Turnover>.sliceLast(): Map<TurnoverKey, Turnover> = groupingBy { it.toKey() } // key for all dimensions except date
    .aggregate { _, accumulator: Turnover?, turnover, _ ->
        if (accumulator == null || turnover.date.isAfter(accumulator.date)) {
            turnover
        } else {
            accumulator
        }
    }