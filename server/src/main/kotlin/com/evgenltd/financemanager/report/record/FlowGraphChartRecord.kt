package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.record.Reference
import java.math.BigDecimal
import java.time.LocalDate

data class FlowGraphChartRecord(
    val nodes: List<Node>,
    val links: List<Link>
) {

    enum class Type {
        IN, OUT, EXCHANGE
    }

    data class Node(
        val id: String,
        val direction: Type,
        val date: LocalDate,
        val amount: Amount? = null,
        val category: Reference? = null,
        val amountFrom: Amount? = null,
        val amountTo: Amount? = null,
        val rate: BigDecimal? = null
    )

    data class Link(
        var source: String,
        var target: String,
        val date: LocalDate,
        val exchange: Boolean,
        val amount: Amount? = null,
        val rate: BigDecimal? = null
    )

}