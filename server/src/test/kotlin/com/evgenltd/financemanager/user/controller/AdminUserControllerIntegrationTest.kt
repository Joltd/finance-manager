package com.evgenltd.financemanager.user.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.testsupport.ApiResponse
import com.evgenltd.financemanager.user.component.ROOT_TENANT
import com.evgenltd.financemanager.user.entity.User
import com.evgenltd.financemanager.user.entity.UserRole
import com.evgenltd.financemanager.user.record.AdminUserRecord
import com.evgenltd.financemanager.user.repository.UserRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import java.util.UUID

class AdminUserControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var userRepository: UserRepository

    @AfterEach
    fun tearDown() {
        userRepository.deleteAll()
    }

    private fun adminHeaders(): HttpHeaders = HttpHeaders().apply {
        setBearerAuth(tokenProvider.createAccessToken(UUID.randomUUID(), "admin", UserRole.ADMIN, ROOT_TENANT))
        contentType = MediaType.APPLICATION_JSON
    }

    @Test
    fun `list - returns every user regardless of tenant`() {
        userRepository.save(User(tenant = TEST_TENANT, name = "Alice", login = "alice"))
        userRepository.save(User(tenant = UUID.randomUUID(), name = "Bob", login = "bob"))

        val response = restClient.get()
            .uri("/api/v1/admin/user")
            .headers { it.addAll(adminHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<AdminUserRecord>>>() {})

        assertThat(response!!.body).extracting("login").containsExactlyInAnyOrder("alice", "bob")
    }

    @Test
    fun `byId - returns a single user`() {
        val user = userRepository.save(User(tenant = TEST_TENANT, name = "Alice", login = "alice"))

        val response = restClient.get()
            .uri("/api/v1/admin/user/${user.id}")
            .headers { it.addAll(adminHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<AdminUserRecord>>() {})

        assertThat(response!!.body!!.login).isEqualTo("alice")
    }

    @Test
    fun `update - creates a new user with its own tenant`() {
        val response = restClient.post()
            .uri("/api/v1/admin/user")
            .headers { it.addAll(adminHeaders()) }
            .body(AdminUserRecord(id = null, name = "Charlie", login = "charlie", password = "password123", deleted = false))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val saved = userRepository.findAll().first { it.login == "charlie" }
        assertThat(saved.name).isEqualTo("Charlie")
        assertThat(saved.password).isNotBlank()
        assertThat(saved.password).isNotEqualTo("password123") // stored encoded, not raw
    }

    @Test
    fun `update - rejects a duplicate login`() {
        userRepository.save(User(tenant = TEST_TENANT, name = "Alice", login = "alice"))

        val response = restClient.post()
            .uri("/api/v1/admin/user")
            .headers { it.addAll(adminHeaders()) }
            .body(AdminUserRecord(id = null, name = "Alice 2", login = "alice", password = "password123", deleted = false))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode.is4xxClientError).isTrue()
    }

    @Test
    fun `delete - hard deletes a user with no dependent data`() {
        val user = userRepository.save(User(tenant = TEST_TENANT, name = "Alice", login = "alice"))

        val response = restClient.delete()
            .uri("/api/v1/admin/user/${user.id}")
            .headers { it.addAll(adminHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(userRepository.findById(user.id!!)).isEmpty()
    }

    @Test
    fun `list - a USER-role token is rejected`() {
        val response = restClient.get()
            .uri("/api/v1/admin/user")
            .headers { it.addAll(authHeaders()) } // USER role, not ADMIN
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode.is4xxClientError).isTrue()
    }
}
