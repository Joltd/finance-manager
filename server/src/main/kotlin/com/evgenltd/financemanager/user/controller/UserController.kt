package com.evgenltd.financemanager.user.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.common.util.badRequestException
import com.evgenltd.financemanager.common.util.unauthorizedException
import com.evgenltd.financemanager.user.component.ROOT_TENANT
import com.evgenltd.financemanager.user.entity.UserRole
import com.evgenltd.financemanager.user.record.ApplicationUser
import com.evgenltd.financemanager.user.record.AuthenticationRefreshRequest
import com.evgenltd.financemanager.user.record.AuthenticationRefreshResponse
import com.evgenltd.financemanager.user.record.AuthenticationRequest
import com.evgenltd.financemanager.user.record.AuthenticationResponse
import com.evgenltd.financemanager.user.record.UserRecord
import com.evgenltd.financemanager.user.repository.UserRepository
import com.evgenltd.financemanager.user.service.TokenProvider
import com.evgenltd.financemanager.user.service.UserService
import com.evgenltd.financemanager.user.service.currentUser
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtException
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
@DataResponse
@SkipLogging
class UserController(
    private val authenticationManager: AuthenticationManager,
    private val tokenProvider: TokenProvider,
    private val userService: UserService,
    private val userRepository: UserRepository,
    private val jwtDecoder: JwtDecoder,
) : Loggable() {

    @GetMapping("/api/v1/user")
    @PreAuthorize("isAuthenticated()")
    fun user(): UserRecord = currentUser()
        ?.let { userService.byIdOrNull(it) }
        ?: throw unauthorizedException()

    @PostMapping("/api/v1/user")
    @PreAuthorize("hasRole('USER')")
    fun updateUser(@RequestBody request: UserRecord) {
        val id = currentUser() ?: throw unauthorizedException()
        userService.update(id, request)
    }

    @PostMapping("/api/v1/user/auth")
    fun auth(@RequestBody request: AuthenticationRequest): ResponseEntity<AuthenticationResponse> {
        val authRequest = UsernamePasswordAuthenticationToken.unauthenticated(request.login, request.password)
        val authResponse = authenticationManager.authenticate(authRequest)

        val user = authResponse.principal as ApplicationUser
        val tenant = if (user.role == UserRole.ADMIN) {
            ROOT_TENANT
        } else {
            user.tenant
        } ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        val refreshToken = tokenProvider.createRefreshToken(user.id, user.login)
        val accessToken = tokenProvider.createAccessToken(user.id, user.login, user.role, tenant)

        return ResponseEntity.ok(AuthenticationResponse(accessToken = accessToken, refreshToken = refreshToken))
    }

    @PostMapping("/api/v1/user/auth/refresh")
    fun authRefresh(@RequestBody request: AuthenticationRefreshRequest): ResponseEntity<AuthenticationRefreshResponse> {
        val jwt = try {
            jwtDecoder.decode(request.refreshToken)
        } catch (e: JwtException) {
            log.error("Invalid jwt", e)
            throw BadCredentialsException("Invalid refresh token")
        }

        val user = userRepository.findByLoginAndDeletedIsFalse(jwt.subject)
            ?: throw BadCredentialsException("User deleted or not found")

        val tenant = if (user.role == UserRole.ADMIN) {
            ROOT_TENANT
        } else {
            user.tenant
        } ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        val accessToken = tokenProvider.createAccessToken(user.id!!, user.login, user.role, tenant)
        return ResponseEntity.ok(AuthenticationRefreshResponse(accessToken = accessToken))
    }

}