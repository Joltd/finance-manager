package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SseEventMapping
import com.evgenltd.financemanager.common.record.NotificationRecord
import com.evgenltd.financemanager.common.record.NotificationType
import org.springframework.stereotype.Service

@Service
class NotificationEventService {

    @SseEventMapping("/notification")
    fun notification(message: String, type: NotificationType): NotificationRecord = NotificationRecord(type, message)

}