package com.evgenltd.financemanager.user.record

import com.evgenltd.financemanager.settings.record.AdminSettingsRecord
import java.util.UUID

data class AdminUserRecord(
    val id: UUID? = null,
    val tenant: UUID? = null,
    val name: String,
    val login: String,
    val password: String? = null,
    val deleted: Boolean = false,
    val settings: AdminSettingsRecord? = null,
    val demo: Boolean = false,
)
