package com.evgenltd.financemanager.reference.record

import java.util.*

data class Reference(
    val id: UUID,
    val name: String,
    val deleted: Boolean = false,
)