package com.evgenltd.financemanager.user.component

import org.slf4j.MDC
import java.util.UUID

const val MDC_REQUEST_ID = "requestId"
const val MDC_TENANT = "tenant"
const val MDC_USER = "user"

fun currentRequestId(): String? = MDC.get(MDC_REQUEST_ID)

fun <T> withMdc(requestId: String? = null, tenant: UUID? = null, user: UUID? = null, block: () -> T): T {
    val previousRequestId = MDC.get(MDC_REQUEST_ID)
    val previousTenant = MDC.get(MDC_TENANT)
    val previousUser = MDC.get(MDC_USER)
    try {
        MDC.put(MDC_REQUEST_ID, requestId ?: previousRequestId ?: UUID.randomUUID().toString())
        MDC.put(MDC_TENANT, tenant?.toString() ?: previousTenant ?: "-")
        MDC.put(MDC_USER, user?.toString() ?: previousUser ?: "-")
        return block()
    } finally {
        putOrRemove(MDC_REQUEST_ID, previousRequestId)
        putOrRemove(MDC_TENANT, previousTenant)
        putOrRemove(MDC_USER, previousUser)
    }
}

private fun putOrRemove(key: String, value: String?) {
    if (value != null) MDC.put(key, value) else MDC.remove(key)
}
