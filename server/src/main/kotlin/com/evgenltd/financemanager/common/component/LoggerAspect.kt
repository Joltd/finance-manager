package com.evgenltd.financemanager.common.component

import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Pointcut
import org.aspectj.lang.reflect.MethodSignature
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.io.InputStream
import java.io.OutputStream
import java.util.concurrent.TimeUnit

@Aspect
@Component
class LoggerAspect {

    @Pointcut(
        """
        (
            execution(public * (@org.springframework.stereotype.Service *).*(..)) ||
            execution(public * (@org.springframework.web.bind.annotation.RestController *).*(..))
        ) &&
        !execution(public * (@com.evgenltd.financemanager.common.component.SkipLogging *).*(..)) &&
        !@annotation(com.evgenltd.financemanager.common.component.SkipLogging) &&
        !execution(public * *..*Converter.*(..))
        """
    )
    fun targetPointcut() {}

    @Around("targetPointcut()")
    fun logAround(joinPoint: ProceedingJoinPoint): Any? {
        val methodSignature = joinPoint.signature as MethodSignature
        val className = methodSignature.declaringType.simpleName
        val methodName = methodSignature.name
        val parameterNames = methodSignature.parameterNames
        val args = joinPoint.args

        val log = LoggerFactory.getLogger(className)

        val startTime = System.nanoTime()
        try {
            val result = joinPoint.proceed()
            val executionTime = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startTime)

            // Log method exit with return value and execution time
            log.info("{}({}) return: {} -- {} ms",
                methodName,
                formatArguments(parameterNames, args),
                formatReturnValue(result),
                executionTime
            )

            return result
        } catch (e: Exception) {
            val executionTime = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startTime)

            // Log method exit with exception and execution time
            log.error("{}({}) -- {} ms",
                methodName,
                formatArguments(parameterNames, args),
                executionTime,
            )

            throw e
        }
    }

    private fun formatArguments(parameterNames: Array<String>, args: Array<Any?>): String =
        parameterNames.zip(args).joinToString(", ") { (name, arg) -> "$name=${formatValue(arg)}" }

    private fun formatReturnValue(value: Any?): String = formatValue(value)

    private fun formatValue(value: Any?): String = when (value) {
        null -> "null"
        is MultipartFile -> "[MultipartFile: ${value.originalFilename}, size=${value.size}]"
        is InputStream -> "[InputStream]"
        is OutputStream -> "[OutputStream]"
        is ByteArray -> "[ByteArray: size=${value.size}]"
        is Collection<*> -> {
            if (value.isEmpty()) "[]"
            else "[Collection with ${value.size} items]"
        }
        is Map<*, *> -> {
            if (value.isEmpty()) "{}"
            else "{Map with ${value.size} entries}"
        }
        else -> value.toString()
    }
}
