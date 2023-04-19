package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.transaction.entity.Direction
import java.time.LocalDate

data class FlowGraphChartRecord(
    val nodes: List<Node>,
    val links: List<Link>
) {

    data class Node(
        val id: String,
        val direction: Direction,
        val date: LocalDate,
        val amount: Amount,
        val outside: Boolean = false
    )

    data class Link(
        val source: String,
        val target: String,
        val amount: Amount?
    )

}