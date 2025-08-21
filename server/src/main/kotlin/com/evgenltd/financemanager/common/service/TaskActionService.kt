package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.component.Task
import com.evgenltd.financemanager.common.component.TaskKey
import com.evgenltd.financemanager.common.component.TaskVersion
import com.evgenltd.financemanager.common.repository.TaskRepository
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Loggable
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import org.aspectj.lang.JoinPoint
import org.aspectj.lang.reflect.MethodSignature
import org.springframework.beans.factory.ListableBeanFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Service
class TaskActionService(
    private val taskRepository: TaskRepository,
    private val context: ListableBeanFactory,
    private val mapper: ObjectMapper,
) : Loggable() {

    @SkipLogging
    @Transactional
    fun lock(id: UUID): Int? = try {
        taskRepository.lock(id).takeIf { it > 0 }
    } catch (ignored: Exception) {
        null
    }

    @SkipLogging
    @Transactional
    fun unlock(id: UUID) = taskRepository.unlock(id)

    @SkipLogging
    @Transactional
    fun trySchedule(joinPoint: JoinPoint): Boolean {
        val methodSignature = joinPoint.signature as MethodSignature

        val bean = methodSignature.declaringTypeName
        val method = methodSignature.name

        val parameters = methodSignature.method
            .parameters
            .zip(joinPoint.args)

        val keyParameters = parameters.filter { (parameter) -> parameter.isAnnotationPresent(TaskKey::class.java) }
            .takeIf { it.isNotEmpty() }
            ?: parameters.filter { (parameter) -> !parameter.isAnnotationPresent(TaskVersion::class.java) }
        val key = keyParameters
            .joinToString("-") { (_, argument) -> argument.toString() }

        if (local.get() == key) {
            return false
        }

        val version = parameters.firstOrNull { (parameter) -> parameter.isAnnotationPresent(TaskVersion::class.java) }
            ?.let { (parameter, argument) -> argument.asVersion(parameter.getAnnotation(TaskVersion::class.java)!!) }
            ?: 0

        val payload = parameters
            .associate { (parameter, argument) -> parameter.name to argument }
            .let { mapper.valueToTree<ObjectNode>(it) }

        log.info("schedule(bean=$bean, method=$method, key=$key, version=$version, payload=$payload)")
        taskRepository.upsert(bean, method, key, version, payload)
        return true
    }

    private fun Any?.asVersion(annotation: TaskVersion): Long? {
        val result = when (this) {
            is Number -> toLong()
            is LocalDate -> toEpochDay()
            else -> 0
        }

        return if (annotation.reversed) {
            -result
        } else {
            result
        }
    }

    fun execute(id: UUID) {
        val task = taskRepository.find(id)

        val beanClass = Class.forName(task.bean)
        val bean = context.getBean(beanClass)
        val method = beanClass.declaredMethods
            .filter { it.name == task.method }
            .filter { it.isAnnotationPresent(Task::class.java) }
            .takeIf { it.size == 1 }
            ?.first()
            ?: throw IllegalStateException("Unable to find method ${task.method} in bean ${task.bean} or too many candidates found")

        val parameterTypes = method.parameters.associate { it.name to it.type }

        val actualParameters = task.payload
            .fields()
            .asSequence()
            .mapNotNull { (name, node) ->
                val type = parameterTypes[name]
                if (type == null) {
                    null
                } else {
                    name to mapper.treeToValue(node, type)
                }
            }
            .associate { it }

        val arguments = method.parameters
            .map { actualParameters[it.name] }
            .toTypedArray()

        local.set(task.key)
        try {
            method.invoke(bean, *arguments)
        } finally {
            local.remove()
        }
    }

    private companion object {
        val local = ThreadLocal<String>()
    }

}