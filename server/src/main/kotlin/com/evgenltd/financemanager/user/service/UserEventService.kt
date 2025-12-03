package com.evgenltd.financemanager.user.service

import com.evgenltd.financemanager.common.component.SseEventMapping
import org.springframework.stereotype.Service

@Service
class UserEventService {

    @SseEventMapping("/api/v1/admin/user")
    fun adminUser() {}
}