package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.component.SseEventMapping
import org.springframework.stereotype.Service

@Service
class OperationEventService {

    @SseEventMapping("/api/v1/operation")
    fun operation() {}

}