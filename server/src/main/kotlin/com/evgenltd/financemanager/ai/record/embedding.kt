package com.evgenltd.financemanager.ai.record

import java.util.UUID

data class EmbeddingRecord(
    val id: UUID,
    val input: String?,
)

data class EmbeddingVectorRecord(
    val vector: String
)