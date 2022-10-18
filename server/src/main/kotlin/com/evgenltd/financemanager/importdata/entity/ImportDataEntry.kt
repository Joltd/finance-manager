package com.evgenltd.financemanager.importdata.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.transaction.entity.Direction
import java.time.LocalDate

class ImportDataEntry(
        var id: String,
        var date: LocalDate,
        var direction: Direction,
        var amount: Amount,
        var description: String,
        var imported: Boolean
)