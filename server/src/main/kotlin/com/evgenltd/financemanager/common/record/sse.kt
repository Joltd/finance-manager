package com.evgenltd.financemanager.common.record

import org.springframework.context.ApplicationEvent
import java.util.UUID

data class SseEvent(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val data: Any = "",
) : ApplicationEvent(data)