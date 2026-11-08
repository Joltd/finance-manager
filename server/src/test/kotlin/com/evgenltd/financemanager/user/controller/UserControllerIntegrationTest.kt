package com.evgenltd.financemanager.user.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.testsupport.ApiResponse
import com.evgenltd.financemanager.user.entity.User
import com.evgenltd.financemanager.user.entity.UserRole
import com.evgenltd.financemanager.user.record.AuthenticationRefreshRequest
import com.evgenltd.financemanager.user.record.AuthenticationRefreshResponse
import com.evgenltd.financemanager.user.record.AuthenticationRequest
import com.evgenltd.financemanager.user.record.AuthenticationResponse
import com.evgenltd.financemanager.user.record.UserRecord
import com.evgenltd.financemanager.user.repository.UserRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder

class UserControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    @AfterEach
    fun tearDown() {
        userRepository.deleteAll()
    }

    /**
     * User has @GeneratedValue(UUID); saving with a pre-set id (to match the fixed
     * TEST_USER_ID authHeaders() always mints) makes Spring Data treat it as "not new" and
     * merge instead of insert, failing since no such row exists yet. So these tests let the id
     * auto-generate and mint their own token for that real id instead of using authHeaders().
     */
    private fun headersFor(user: User): HttpHeaders = HttpHeaders().apply {
        setBearerAuth(tokenProvider.createAccessToken(user.id!!, user.login, UserRole.USER, TEST_TENANT))
        contentType = MediaType.APPLICATION_JSON
    }

    @Test
    fun `auth - a valid login and password returns access and refresh tokens`() {
        userRepository.save(User(tenant = TEST_TENANT, name = "Test User", login = "auth-user", password = passwordEncoder.encode("password123")!!))

        val response = restClient.post()
            .uri("/api/public/v1/user/auth")
            .body(AuthenticationRequest(login = "auth-user", password = "password123"))
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<AuthenticationResponse>>() {})

        val auth = response!!.body!!
        assertThat(auth.accessToken).isNotBlank()
        assertThat(auth.refreshToken).isNotBlank()
    }

    @Test
    fun `auth - an incorrect password is rejected`() {
        userRepository.save(User(tenant = TEST_TENANT, name = "Test User", login = "auth-user-2", password = passwordEncoder.encode("password123")!!))

        val response = restClient.post()
            .uri("/api/public/v1/user/auth")
            .body(AuthenticationRequest(login = "auth-user-2", password = "wrong-password"))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode.is4xxClientError).isTrue()
    }

    @Test
    fun `authRefresh - a valid refresh token issues a new access token and a rotated refresh token`() {
        userRepository.save(User(tenant = TEST_TENANT, name = "Test User", login = "auth-user-3", password = passwordEncoder.encode("password123")!!))
        val login = login("auth-user-3", "password123")

        val refreshed = refresh(login.refreshToken)

        assertThat(refreshed.statusCode).isEqualTo(HttpStatus.OK)
        val body = refreshed.body!!.body!!
        assertThat(body.accessToken).isNotBlank()
        assertThat(body.refreshToken).isNotBlank()

        // the rotated refresh token is itself a valid refresh token
        val refreshedAgain = refresh(body.refreshToken)
        assertThat(refreshedAgain.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(refreshedAgain.body!!.body!!.accessToken).isNotBlank()
    }

    @Test
    fun `authRefresh - an access token is not accepted as a refresh token`() {
        userRepository.save(User(tenant = TEST_TENANT, name = "Test User", login = "auth-user-4", password = passwordEncoder.encode("password123")!!))
        val login = login("auth-user-4", "password123")

        val response = refresh(login.accessToken)

        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
    }

    private fun login(login: String, password: String): AuthenticationResponse = restClient.post()
        .uri("/api/public/v1/user/auth")
        .body(AuthenticationRequest(login = login, password = password))
        .retrieve()
        .body(object : ParameterizedTypeReference<ApiResponse<AuthenticationResponse>>() {})!!
        .body!!

    private fun refresh(refreshToken: String) = restClient.post()
        .uri("/api/public/v1/user/auth/refresh")
        .body(AuthenticationRefreshRequest(refreshToken = refreshToken))
        .retrieve()
        .toEntity(object : ParameterizedTypeReference<ApiResponse<AuthenticationRefreshResponse>>() {})

    @Test
    fun `user - returns the current user's own record`() {
        val user = userRepository.save(User(tenant = TEST_TENANT, name = "Test User", login = "self-user"))

        val response = restClient.get()
            .uri("/api/v1/user")
            .headers { it.addAll(headersFor(user)) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<UserRecord>>() {})

        assertThat(response!!.body!!.name).isEqualTo("Test User")
    }

    @Test
    fun `updateUser - changes the current user's name`() {
        val user = userRepository.save(User(tenant = TEST_TENANT, name = "Old name", login = "self-user-2"))
        val current = restClient.get()
            .uri("/api/v1/user")
            .headers { it.addAll(headersFor(user)) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<UserRecord>>() {})!!
            .body!!

        val response = restClient.post()
            .uri("/api/v1/user")
            .headers { it.addAll(headersFor(user)) }
            .body(current.copy(name = "New name"))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(userRepository.findById(user.id!!).get().name).isEqualTo("New name")
    }
}
