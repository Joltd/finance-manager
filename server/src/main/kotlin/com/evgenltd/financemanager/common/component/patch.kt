package com.evgenltd.financemanager.common.component

import com.evgenltd.financemanager.common.record.SseEvent
import java.util.*

data class Pointer(
    val field: String,
    val value: Any? = null,
)

data class Path(
    val pointers: List<Pointer>,
)

data class Patch(
    val path: Path,
    val value: Any?,
)

class PathBuilder {
    private val pointers = mutableListOf<Pointer>()

    fun path(field: String, value: Any? = null): PathBuilder {
        pointers.add(Pointer(field, value))
        return this
    }

    fun build(): Path = Path(pointers)
}

fun patchEvent(name: String, value: Any?, block: (PathBuilder) -> Unit): SseEvent {
    val pathBuilder = PathBuilder().apply(block)
    val patch = Patch(pathBuilder.build(), value)
    return SseEvent(UUID.randomUUID(), name, patch)
}