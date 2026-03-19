package com.evgenltd.financemanager.common.record

import java.time.Instant

data class SseEnvelope(
    val payload: Any? = null,
    val timestamp: Instant = Instant.now(),
)
