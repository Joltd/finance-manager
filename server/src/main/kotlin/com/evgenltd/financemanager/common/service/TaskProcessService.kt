package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.util.Loggable
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import java.util.*

@Service
class TaskProcessService(
    private val taskActionService: TaskActionService,
) : Loggable() {

    @SkipLogging
    @Async
    fun execute(id: UUID) {
        taskActionService.lock(id) ?: return
        try {
            taskActionService.execute(id)
        } catch (e: Exception) {
            log.error("Unable to execute task $id", e)
        } finally {
            taskActionService.unlock(id)
        }
    }

}