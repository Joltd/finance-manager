package com.evgenltd.financemanager.user.record

import java.util.UUID

data class AdminUserRecord(
    val id: UUID? = null,
    val tenant: UUID? = null,
    val name: String,
    val login: String,
    val password: String? = null,
    val deleted: Boolean = false,
)