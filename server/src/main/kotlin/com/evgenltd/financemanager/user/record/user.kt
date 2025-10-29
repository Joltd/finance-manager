package com.evgenltd.financemanager.user.record

import com.evgenltd.financemanager.settings.record.SettingsRecord
import com.evgenltd.financemanager.user.entity.UserRole
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.UUID

class ApplicationUser(
    val id: UUID,
    val login: String,
    private val password: String,
    val role: UserRole,
    val tenant: UUID?,
    private val deleted: Boolean,
) : UserDetails {
    override fun getAuthorities(): Collection<GrantedAuthority> = if (deleted) emptyList() else listOf(SimpleGrantedAuthority(role.name))

    override fun getPassword(): String = password

    override fun getUsername(): String = login
}

data class AuthenticationRequest(
    val login: String,
    val password: String,
)

data class AuthenticationResponse(
    val accessToken: String,
    val refreshToken: String,
)

data class AuthenticationRefreshRequest(
    val refreshToken: String,
)

data class AuthenticationRefreshResponse(
    val accessToken: String,
)

data class UserRecord(
    val id: UUID,
    val name: String,
    val login: String,
    val role: UserRole,
    val settings: SettingsRecord,
)
