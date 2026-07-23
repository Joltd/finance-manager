package com.evgenltd.financemanager.filterpreset.record

import java.util.*

data class FilterPresetRecord(
    val id: UUID?,
    val presetKey: String,
    val name: String,
    val filter: Map<String, Any?>,
)
