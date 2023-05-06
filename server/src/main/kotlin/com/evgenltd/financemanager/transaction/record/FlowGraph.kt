package com.evgenltd.financemanager.transaction.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.transaction.entity.Relation
import com.evgenltd.financemanager.transaction.entity.Transaction

data class FlowGraph(
    val nodes: List<FlowGraphNode>,
    val edges: List<FlowGraphEdge>,
    val targetAmount: Amount
)

data class FlowGraphNode(
    val transaction: Transaction,
    val targetAmount: Amount? = null,
)

data class FlowGraphEdge(
    val relation: Relation
)