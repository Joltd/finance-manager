package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.common.util.conflictException
import com.evgenltd.financemanager.user.component.logger
import org.springframework.integration.support.locks.LockRegistry
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.concurrent.TimeUnit

@Service
@SkipLogging
class LockService(
    private val lockRegistry: LockRegistry
) : Loggable() {

    fun withLockEntity(entityName: String, id: UUID, block: () -> Unit) {
        withLock("$entityName:$id", block)
    }

    fun withLock(key: String, block: () -> Unit) {
        val lock = lockRegistry.obtain(key)

        val locked = try {
            lock.tryLock(2, TimeUnit.SECONDS)
        } catch (e: InterruptedException) {
            Thread.currentThread().interrupt()
            throw IllegalStateException("Lock acquisition interrupted for key=$key", e)
        }

        if (!locked) {
            throw conflictException("Resource is locked: $key")
        }

        try {
            block()
        } finally {
            lock.unlock()
        }
    }

    fun withTryLockEntity(entityName: String, id: UUID, block: () -> Unit): Boolean {
        return withTryLock("$entityName:$id", block)
    }

    fun withTryLock(key: String, block: () -> Unit): Boolean {
        val lock = lockRegistry.obtain(key)

        val locked = try {
            lock.tryLock(2, TimeUnit.SECONDS)
        } catch (e: InterruptedException) {
            Thread.currentThread().interrupt()
            throw IllegalStateException("Lock acquisition interrupted for key=$key", e)
        }

        if (!locked) {
            logger.warn("Lock already acquired for key=$key")
            return false
        }

        try {
            block()
            return true
        } finally {
            lock.unlock()
        }
    }

}