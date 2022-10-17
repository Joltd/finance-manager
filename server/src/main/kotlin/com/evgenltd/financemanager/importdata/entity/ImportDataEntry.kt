package com.evgenltd.financemanager.importdata.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.transaction.entity.Direction
import java.time.LocalDate

class ImportDataEntry(
        val id: String,
        val date: LocalDate,
        val direction: Direction,
        val amount: Amount,
        val description: String
)