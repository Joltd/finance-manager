package com.evgenltd.financemanager.user.component

import com.evgenltd.financemanager.user.service.currentUser
import org.slf4j.MDC
import org.springframework.core.task.TaskDecorator
import org.springframework.stereotype.Component

@Component
class ContextPropagatingTaskDecorator : TaskDecorator {
    override fun decorate(runnable: Runnable): Runnable {
        val tenant = currentTenant()
        val user = currentUser()
        val requestId = currentRequestId()
        return Runnable {
            withTenant(tenant) {
                withMdc(requestId, tenant, user) {
                    runnable.run()
                }
            }
        }
    }
}