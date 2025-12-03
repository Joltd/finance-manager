package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.component.SseEventMapping
import org.springframework.stereotype.Service

@Service
class CurrencyEventService {

    @SseEventMapping("/api/v1/currency")
    fun currency() {}

}