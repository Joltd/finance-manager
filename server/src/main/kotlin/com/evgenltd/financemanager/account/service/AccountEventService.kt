package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.component.SseEventMapping
import org.springframework.stereotype.Service

@Service
class AccountEventService {

    @SseEventMapping("/api/v1/account")
    fun account() {}
}