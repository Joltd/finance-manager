package com.evgenltd.financemanager.common.component

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

fun patch(value: Any?, path: String = ""): Patch = path.split("/")
    .filter { it.isNotBlank() }
    .map { it.pointer() }
    .let { Path(it) }
    .let { Patch(it, value) }

private fun String.pointer(): Pointer {
    val parts = split("=")
    if (parts.size > 1) {
        val (field, value) = parts
        return Pointer(field, value)
    } else {
        return Pointer(this)
    }
}