package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.entity.Task
import com.evgenltd.financemanager.common.repository.TaskRepository
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.lt
import org.springframework.data.domain.Pageable
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit

@SkipLogging
@Service
class TaskSchedulerService(
    private val taskRepository: TaskRepository,
    private val taskProcessService: TaskProcessService,
) {

//    @Scheduled(fixedRate = 1000)
    fun process() {
        val tasks = taskRepository.findForExecution()
        for (task in tasks) {
            taskProcessService.execute(task)
        }
    }

//    @Scheduled(fixedRate = 1000)
    fun cleanup() {
        val outdated = Instant.now().minus(5, ChronoUnit.MINUTES)
        ((Task::progress eq true) and (Task::startedAt lt outdated))
            .let { taskRepository.findAll(it, Pageable.ofSize(50)) }
            .onEach { taskRepository.delete(it) }
    }

}