package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.record.SseEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.concurrent.CopyOnWriteArrayList

@Service
class SseService {

    private val emitters: MutableList<SseEmitter> = CopyOnWriteArrayList()

    fun subscribe(): SseEmitter = SseEmitter().also { emitter ->
        emitter.onTimeout {
            emitter.complete()
        }
        emitter.onCompletion {
            emitters.remove(emitter)
        }
        emitters.add(emitter)
    }

    @EventListener
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