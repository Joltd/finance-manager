package com.evgenltd.financemanager.user.config

/**
 * Kind of JWT, stored in the [CLAIM] claim. Each kind has its own decoder in [SecurityConfig],
 * so a token is accepted only where its kind is expected.
 */
enum class TokenType(val claimValue: String) {
    ACCESS("access"),
    REFRESH("refresh");

    companion object {
        const val CLAIM = "token_type"
    }
}
