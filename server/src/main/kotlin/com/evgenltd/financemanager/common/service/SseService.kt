package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.SseEvent
import com.evgenltd.financemanager.common.util.Loggable
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.concurrent.CopyOnWriteArrayList

@Service
@SkipLogging
class SseService : Loggable() {

    private val emitters: MutableList<SseEmitter> = CopyOnWriteArrayList()

    fun subscribe(): SseEmitter = SseEmitter(0).also { emitter ->
        emitter.onTimeout {
            emitters.remove(emitter)
            log.warn("Emitter timed out")
        }
        emitter.onCompletion {
            emitters.remove(emitter)
            log.warn("Emitter completed")
        }
        emitter.onError {
            emitters.remove(emitter)
            log.warn("Emitter error", it)
        }
        emitters.add(emitter)
    }

    @Scheduled(fixedRate = 10_000)
    fun heartbeat() {
        val event = SseEvent(name = "heartbeat")
        onEvent(event)
    }

    @EventListener
    @Async
    fun onEvent(event: SseEvent) {

        for (emitter in emitters) {
            val emitterEvent = SseEmitter.event()
                .id(event.id.toString())
                .name(event.name)
                .data(event.data)

            try {
                emitter.send(emitterEvent)
            } catch (e: Exception) {
                log.error("Unable to send SSE event", e)
                emitters.remove(emitter)
                continue
            }
        }
    }

}