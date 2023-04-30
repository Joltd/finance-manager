package com.evgenltd.financemanager.transaction.entity

import java.time.LocalDate

class GraphState(
    var id: String?,
    var date: LocalDate,
    var status: GraphStatus,
    var error: String? = null,
    var fund: Fund
)

enum class GraphStatus {
    ACTUAL,
    REBUILD,
    OUTDATED
}