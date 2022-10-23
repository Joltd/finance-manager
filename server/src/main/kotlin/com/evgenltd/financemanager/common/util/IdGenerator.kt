package com.evgenltd.financemanager.common.util

import com.evgenltd.financemanager.transaction.entity.Direction
import java.time.LocalDate

class IdGenerator {

    private val ids: MutableMap<String,Int> = mutableMapOf()

    fun next(id: String): String {
        val nextCount = (ids[id] ?: 0)
                .let { it + 1 }
                .also { ids[id] = it }
        return "$id-$nextCount"
    }

}