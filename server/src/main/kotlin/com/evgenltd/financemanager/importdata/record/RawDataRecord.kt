package com.evgenltd.financemanager.importdata.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate

data class RawDataRecord(
        val date: LocalDate,
        val amount: Amount,
        val description: String
)