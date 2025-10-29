package com.evgenltd.financemanager.user.service

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import java.util.UUID

fun currentUser(): UUID? {
    val principal = SecurityContextHolder.getContext()
        .authentication
        ?.principal as? Jwt

    return principal?.getClaimAsString("userId")
        ?.let { UUID.fromString(it) }
}
