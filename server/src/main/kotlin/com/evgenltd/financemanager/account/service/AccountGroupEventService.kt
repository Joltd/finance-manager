package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.component.SseEventMapping
import org.springframework.stereotype.Service

@Service
class AccountGroupEventService {

    @SseEventMapping("/account-group")
    fun accountGroup() {}

}