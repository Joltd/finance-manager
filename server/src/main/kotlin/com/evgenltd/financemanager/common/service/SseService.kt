package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.SseEvent
import com.evgenltd.financemanager.common.util.Loggable
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.*
import java.util.concurrent.CopyOnWriteArrayList

@Service
@SkipLogging
class SseService : Loggable() {

    private val emitters: MutableList<SseEmitter> = CopyOnWriteArrayList()

    fun subscribe(): SseEmitter = SseEmitter(0L).also { emitter ->
        emitter.onTimeout {
            emitter.complete()
        }
        emitter.onCompletion {
            emitters.remove(emitter)
        }
        emitters.add(emitter)
    }

    @Scheduled(fixedRate = 30_000)
    fun heartbeat() {
        val event = SseEvent(
            id = UUID.randomUUID(),
            name = "heartbeat",
            data = ""
        )
        onEvent(event)
    }

    @EventListener
    @Async
    fun onEvent(event: SseEvent) {
        emitters.onEach { emitter ->
            SseEmitter.event()
                .id(event.id.toString())
                .name(event.name)
                .data(event.data)
                .also { emitter.send(it) }
        }
    }

}