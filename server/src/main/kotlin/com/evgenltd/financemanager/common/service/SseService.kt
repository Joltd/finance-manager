package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.SseEnvelope
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.user.component.ROOT_TENANT
import com.evgenltd.financemanager.user.component.currentTenant
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.io.IOException
import java.util.*
import java.util.concurrent.ConcurrentHashMap

@Service
@SkipLogging
class SseService(
    @Value("\${sse.connection-timeout-ms:60000}")
    private val connectionTimeoutMs: Long,
    @Value("\${sse.max-connections-per-tenant:10}")
    private val maxConnectionsPerTenant: Int,
) : Loggable() {

    private val emitters: MutableMap<EmitterKey, SseEmitter> = ConcurrentHashMap()

    fun subscribe(): SseEmitter {

        val tenant = currentTenant()

        if (tenant == null || tenant == ROOT_TENANT) {
            log.warn("Sse subscription without user tenant, actual {}", tenant)
            throw AccessDeniedException("SSE subscription requires user tenant")
        }

        enforceTenantConnectionLimit(tenant)

        val emitterKey = EmitterKey(tenant)
        val emitter = SseEmitter(connectionTimeoutMs)

        emitter.onTimeout {
            removeEmitter(emitterKey, emitter, reason = "timed out")
            log.warn("Emitter timed out")
        }
        emitter.onCompletion {
            removeEmitter(emitterKey, emitter, reason = "completed")
            log.warn("Emitter completed")
        }
        emitter.onError {
            removeEmitter(emitterKey, emitter, it, "error")
            if (it !is IOException) {
                log.warn("Emitter error", it)
            }
        }
        emitters[emitterKey] = emitter

        return emitter
    }

    @Scheduled(fixedRate = 10_000)
    fun heartbeat() {
        emitters.onEach { (key, emitter) ->
            sendEvent(key, emitter, channel = "heartbeat", payload = null)
        }
    }

    @Async
    fun processEvent(tenant: UUID, channel: String, payload: Any?) {
        emitters.onEach { (key, emitter) ->
            if (key.tenantId == tenant) {
                sendEvent(key, emitter, channel = channel, payload = payload)
            }
        }
    }

    private fun sendEvent(
        emitterKey: EmitterKey,
        emitter: SseEmitter,
        channel: String,
        payload: Any?,
    ) {
        val envelope = SseEnvelope(
            payload = payload,
        )

        val emitterEvent = SseEmitter.event()
            .id(UUID.randomUUID().toString())
            .name(channel)
            .data(envelope)

        try {
            emitter.send(emitterEvent)
        } catch (e: IOException) {
            log.debug("Unable to send SSE event due to closed connection")
            removeEmitter(emitterKey, emitter, e)
        } catch (e: Exception) {
            log.error("Unable to send SSE event", e)
            removeEmitter(emitterKey, emitter, e)
        }
    }

    private fun enforceTenantConnectionLimit(tenant: UUID) {
        val tenantEmitterKeys = emitters.keys.filter { it.tenantId == tenant }
        if (tenantEmitterKeys.size < maxConnectionsPerTenant) {
            return
        }

        val overflow = tenantEmitterKeys.size - maxConnectionsPerTenant + 1
        tenantEmitterKeys
            .sortedBy { it.connectedAt }
            .take(overflow)
            .onEach { emitterKey ->
                emitters[emitterKey]?.let { emitter ->
                    log.warn("Closing oldest emitter for tenant {} due to connection limit {}", tenant, maxConnectionsPerTenant)
                    removeEmitter(emitterKey, emitter, reason = "replaced by newer connection")
                }
            }
    }

    private fun removeEmitter(
        emitterKey: EmitterKey,
        emitter: SseEmitter,
        error: Throwable? = null,
        reason: String? = null,
    ) {
        emitters.remove(emitterKey)
        try {
            if (error == null) {
                emitter.complete()
            } else {
                emitter.completeWithError(error)
            }
        } catch (_: IllegalStateException) {
            // Ignore completion races between container callbacks and async senders.
        }

        if (reason != null) {
            log.debug("Emitter {} removed: {}", emitterKey.id, reason)
        }
    }

    data class EmitterKey(
        val tenantId: UUID,
        val id: UUID = UUID.randomUUID(),
        val connectedAt: Long = System.currentTimeMillis(),
    )

}