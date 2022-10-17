package com.evgenltd.financemanager.common.util

import com.evgenltd.financemanager.transaction.entity.Direction
import java.time.LocalDate

class IdGenerator {

    private val ids: MutableMap<String,Int> = mutableMapOf()

    fun next(date: LocalDate, direction: Direction, amount: Amount): String {
        val id = "$date-$direction-${amount.value}-${amount.currency}"
        val nextCount = (ids[id] ?: 0)
                .let { it + 1 }
                .also { ids[id] = it }
        return "$id-$nextCount"
    }

}