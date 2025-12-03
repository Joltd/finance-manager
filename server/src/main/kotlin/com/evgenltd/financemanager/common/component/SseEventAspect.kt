package com.evgenltd.financemanager.common.component

import com.evgenltd.financemanager.common.record.SseEvent
import com.evgenltd.financemanager.common.service.SseService
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.user.component.ROOT_TENANT
import com.evgenltd.financemanager.user.component.currentTenant
import org.aspectj.lang.JoinPoint
import org.aspectj.lang.annotation.AfterReturning
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Pointcut
import org.aspectj.lang.reflect.MethodSignature
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

@Aspect
@Component
class SseEventAspect(
    private val sseService: SseService,
) : Loggable()  {

    @Pointcut("@annotation(com.evgenltd.financemanager.common.component.SseEventMapping)")
    fun pointcut() {}

    @AfterReturning(pointcut = "pointcut()", returning = "result")
    fun handleSseEvent(joinPoint: JoinPoint, result: Any?) {
        val methodSignature = joinPoint.signature as MethodSignature

        val annotation = methodSignature.method
            ?.getAnnotation(SseEventMapping::class.java)
            ?: return

        val parameters = methodSignature.parameterNames
            .zip(joinPoint.args)
            .associate { it }

        val channel = UriComponentsBuilder.fromPath(annotation.channel)
            .buildAndExpand(parameters)
            .toString()

        val data = when (result) {
            is Patch -> listOf(result)
            null -> ""
            else -> result
        }

        val tenant = currentTenant()
        if (tenant == null || tenant == ROOT_TENANT) {
            log.warn("Event {} sent without user tenant, actual {}", channel, tenant)
            return
        }

        sseService.processEvent(tenant, channel, data)
    }
}
