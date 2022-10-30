package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount

class FlowSeriesRecord(val type: String, val category: String, val amounts: List<Amount>)