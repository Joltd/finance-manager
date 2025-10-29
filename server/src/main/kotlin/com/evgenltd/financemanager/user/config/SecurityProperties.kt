package com.evgenltd.financemanager.user.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "security")
data class SecurityProperties(
    val secret: String,
    val accessTokenExpirationMinutes: Long,
    val refreshTokenExpirationMinutes: Long,
)