package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.record.Reference

class CategoryChartRecord(
    val categories: List<Reference>,
    val amounts: List<Amount>
)