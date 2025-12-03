package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.user.component.ROOT_TENANT
import com.evgenltd.financemanager.user.component.currentTenant
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.io.IOException
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

@Service
@SkipLogging
class SseService : Loggable() {

    private val emitters: MutableMap<EmitterKey, SseEmitter> = ConcurrentHashMap()

    fun subscribe(): SseEmitter? {

        val tenant = currentTenant()

        if (tenant == null || tenant == ROOT_TENANT) {
            log.warn("Sse subscription without user tenant, actual {}", tenant)
            return null
        }

        val emitterKey = EmitterKey(tenant)
        val emitter = SseEmitter(0)

        emitter.onTimeout {
            emitters.remove(emitterKey)
            log.warn("Emitter timed out")
        }
        emitter.onCompletion {
            emitters.remove(emitterKey)
            log.warn("Emitter completed")
        }
        emitter.onError {
            emitters.remove(emitterKey)
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
            sendEvent(key, emitter, "heartbeat", Unit)
        }
    }

    @Async
    fun processEvent(tenant: UUID, channel: String, data: Any) {
        emitters.entries
            .filter { (key, _) -> key.tenantId == tenant }
            .onEach {
                (key, emitter) -> sendEvent(key, emitter, channel, data)
            }
    }

    private fun sendEvent(emitterKey: EmitterKey, emitter: SseEmitter, channel: String, data: Any) {
        val emitterEvent = SseEmitter.event()
            .id(UUID.randomUUID().toString())
            .name(channel)
            .data(data)

        try {
            emitter.send(emitterEvent)
        } catch (e: IOException) {
            log.error("Unable to send SSE event")
            emitters.remove(emitterKey)
        } catch (e: Exception) {
            log.error("Unable to send SSE event", e)
            emitters.remove(emitterKey)
        }
    }

    data class EmitterKey(val tenantId: UUID, val id: UUID = UUID.randomUUID())

}