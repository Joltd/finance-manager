package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.component.SseEventMapping
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class OperationEventService {

    @SseEventMapping("/api/v1/operation/date")
    fun operationDate(dates: List<LocalDate>): List<LocalDate> = dates

}