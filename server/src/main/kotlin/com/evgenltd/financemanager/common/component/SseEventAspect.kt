package com.evgenltd.financemanager.common.component

import com.evgenltd.financemanager.common.record.SseEvent
import org.aspectj.lang.JoinPoint
import org.aspectj.lang.annotation.AfterReturning
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Pointcut
import org.aspectj.lang.reflect.MethodSignature
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder
import java.util.*

@Aspect
@Component
class SseEventAspect(
    private val publisher: ApplicationEventPublisher,
) {

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

        val event = SseEvent(
            name = channel,
            data = data
        )

        publisher.publishEvent(event)
    }
}
