package com.evgenltd.financemanager.user.converter

import com.evgenltd.financemanager.settings.record.SettingsRecord
import com.evgenltd.financemanager.user.entity.User
import com.evgenltd.financemanager.user.entity.UserRole
import com.evgenltd.financemanager.user.record.AdminUserRecord
import com.evgenltd.financemanager.user.record.UserRecord
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserConverter() {

    fun toRecord(entity: User, settings: SettingsRecord): UserRecord = UserRecord(
        id = entity.id!!,
        name = entity.name,
        login = entity.login,
        role = entity.role,
        settings = settings,
    )

    fun toAdminRecord(entity: User): AdminUserRecord = AdminUserRecord(
        id = entity.id!!,
        tenant = entity.tenant,
        name = entity.name,
        login = entity.login,
        deleted = entity.deleted,
    )

}