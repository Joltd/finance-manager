package com.evgenltd.financemanager.reference.record

import java.util.UUID

data class Reference(
    val id: UUID,
    val name: String,
    val deleted: Boolean
)