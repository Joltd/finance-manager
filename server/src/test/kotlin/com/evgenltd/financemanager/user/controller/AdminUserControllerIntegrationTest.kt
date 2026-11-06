package com.evgenltd.financemanager.user.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Currency
import com.evgenltd.financemanager.account.repository.CurrencyRepository
import com.evgenltd.financemanager.settings.entity.Setting
import com.evgenltd.financemanager.settings.record.AdminSettingsRecord
import com.evgenltd.financemanager.settings.repository.SettingRepository
import com.evgenltd.financemanager.testsupport.ApiResponse
import com.evgenltd.financemanager.user.component.ROOT_TENANT
import com.evgenltd.financemanager.user.component.withTenant
import com.evgenltd.financemanager.user.entity.User
import com.evgenltd.financemanager.user.entity.UserRole
import com.evgenltd.financemanager.user.record.AdminUserRecord
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
import java.util.UUID

class AdminUserControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var settingRepository: SettingRepository

    @Autowired
    private lateinit var currencyRepository: CurrencyRepository

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
    fun `admin settings are scoped to the selected tenant and stay read only for the user`() {
        val tenant = UUID.randomUUID()
        val otherTenant = UUID.randomUUID()
        val user = userRepository.save(User(tenant = tenant, name = "Alice", login = "alice"))
        val other = userRepository.save(User(tenant = otherTenant, name = "Bob", login = "bob"))
        val userToken = tokenProvider.createAccessToken(user.id!!, user.login, UserRole.USER, tenant)
        val update = AdminUserRecord(id = user.id, name = user.name, login = user.login, settings = AdminSettingsRecord(true))

        fun saveAsAdmin(record: AdminUserRecord) = restClient.post()
            .uri("/api/v1/admin/user")
            .headers { it.addAll(adminHeaders()) }
            .body(record)
            .retrieve()
            .toBodilessEntity()

        fun readAsAdmin(id: UUID) = restClient.get()
            .uri("/api/v1/admin/user/$id")
            .headers { it.addAll(adminHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<AdminUserRecord>>() {})!!.body!!

        fun readAsUser() = restClient.get()
            .uri("/api/v1/user")
            .headers { it.setBearerAuth(userToken) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<UserRecord>>() {})!!.body!!

        fun saveAsUser(record: UserRecord) = restClient.post()
            .uri("/api/v1/user")
            .headers { it.setBearerAuth(userToken) }
            .body(record)
            .retrieve()
            .toBodilessEntity()

        try {
            withTenant(tenant) {
                currencyRepository.save(Currency(name = "USD", crypto = false))
                settingRepository.save(Setting(name = "operation.default.currency", value = "USD"))
            }
            withTenant(otherTenant) { currencyRepository.save(Currency(name = "USD", crypto = false)) }

            assertThat(saveAsAdmin(update).statusCode).isEqualTo(HttpStatus.OK)
            assertThat(readAsAdmin(user.id!!).settings?.pricingFeature).isTrue()
            assertThat(readAsAdmin(other.id!!).settings?.pricingFeature).isNull()

            assertThat(saveAsAdmin(update.copy(name = "Updated Alice", settings = AdminSettingsRecord())).statusCode)
                .isEqualTo(HttpStatus.OK)
            val current = readAsUser()
            assertThat(current.name).isEqualTo("Updated Alice")
            assertThat(current.settings.pricingFeature).isTrue()

            val userUpdate = current.copy(settings = current.settings.copy(pricingFeature = null, operationDefaultCurrencyScale = 2))
            assertThat(saveAsUser(userUpdate).statusCode).isEqualTo(HttpStatus.OK)
            val saved = readAsUser()
            assertThat(saved.settings.pricingFeature).isTrue()
            assertThat(saved.settings.operationDefaultCurrency).isEqualTo("USD")
            assertThat(saved.settings.operationDefaultCurrencyScale).isEqualTo(2)

            assertThat(saveAsUser(saved.copy(settings = saved.settings.copy(operationDefaultCurrencyScale = null))).statusCode)
                .isEqualTo(HttpStatus.OK)
            assertThat(readAsUser().settings.operationDefaultCurrencyScale).isNull()

            assertThat(saveAsAdmin(update.copy(settings = AdminSettingsRecord(false))).statusCode).isEqualTo(HttpStatus.OK)
            val disabled = readAsUser().settings
            assertThat(disabled.pricingFeature).isFalse()
            assertThat(disabled.operationDefaultCurrency).isEqualTo("USD")
        } finally {
            withTenant(tenant) {
                settingRepository.deleteAll()
                currencyRepository.deleteAll()
            }
            withTenant(otherTenant) { currencyRepository.deleteAll() }
        }
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
