package com.evgenltd.financemanager.common.record

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.context.ApplicationEvent
import java.util.UUID

data class TaskRequestEvent(
    val kind: String,
    val key: String,
    val deep: Int = 0,
    val payload: JsonNode? = null
)

data class TaskExecutionEvent(
    val id: UUID,
    val kind: String,
    val key: String,
    val deep: Int = 0,
    val payload: JsonNode? = null
) : ApplicationEvent(id)