package com.evgenltd.financemanager.turnover.record

import com.evgenltd.financemanager.turnover.entity.Turnover
import java.time.LocalDate
import java.util.*

data class TurnoverKey(val accountId: UUID, val currency: String)