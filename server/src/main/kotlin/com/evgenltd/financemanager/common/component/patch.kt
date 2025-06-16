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

fun patch(value: Any?, block: (PathBuilder) -> Unit = {}): Patch = PathBuilder().apply(block)
    .build()
    .let { Patch(it, value) }

fun patchEvent(name: String, patches: List<Patch>): SseEvent = SseEvent(UUID.randomUUID(), name, patches)