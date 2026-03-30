package com.evgenltd.financemanager.tag.record

import java.util.*

data class TagRecord(
    val id: UUID?,
    val name: String,
    val deleted: Boolean,
)
