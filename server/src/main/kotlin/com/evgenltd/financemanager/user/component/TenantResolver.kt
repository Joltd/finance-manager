package com.evgenltd.financemanager.user.component

import org.hibernate.context.spi.CurrentTenantIdentifierResolver
import java.util.UUID

class TenantResolver : CurrentTenantIdentifierResolver<UUID> {
    override fun isRoot(tenantId: UUID?): Boolean = tenantId == ROOT_TENANT

    override fun resolveCurrentTenantIdentifier(): UUID = tenantContext.get() ?: NULL_TENANT

    override fun validateExistingCurrentSessions(): Boolean = true
}

val NULL_TENANT = UUID(0, 0)
val ROOT_TENANT: UUID = UUID.fromString("ffffffff-ffff-ffff-ffff-ffffffffffff")

val tenantContext: ThreadLocal<UUID?> = ThreadLocal()

fun <T> withTenant(tenant: UUID?, block: () -> T): T {
    try {
        tenantContext.set(tenant)
        return block()
    } finally {
        tenantContext.remove()
    }
}

fun <T> withRootTenant(block: () -> T): T {
    try {
        tenantContext.set(ROOT_TENANT)
        return block()
    } finally {
        tenantContext.remove()
    }
}