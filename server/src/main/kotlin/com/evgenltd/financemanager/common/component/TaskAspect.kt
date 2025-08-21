package com.evgenltd.financemanager.common.component

import com.evgenltd.financemanager.common.service.TaskActionService
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Pointcut
import org.springframework.stereotype.Component

@Aspect
@Component
class TaskAspect(
    private val taskActionService: TaskActionService,
) {

    @Pointcut("@annotation(com.evgenltd.financemanager.common.component.Task)")
    fun pointcut() {}

    @Around("pointcut()")
    fun handleTask(joinPoint: ProceedingJoinPoint) {
        val success = taskActionService.trySchedule(joinPoint)
        if (!success) {
            joinPoint.proceed()
        }
    }

}