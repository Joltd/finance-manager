package com.evgenltd.financemanager.account.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Currency
import com.evgenltd.financemanager.account.record.CurrencyRecord
import com.evgenltd.financemanager.account.repository.CurrencyRepository
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpStatus

class CurrencyControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var currencyRepository: CurrencyRepository

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        withTenant { currencyRepository.deleteAll() }
    }

    @Test
    fun `list - returns currencies ordered by position then name`() {
        withTenant {
            currencyRepository.save(Currency(name = "EUR", crypto = false, position = 1))
            currencyRepository.save(Currency(name = "USD", crypto = false, position = 0))
        }

        val response = restClient.get()
            .uri("/api/v1/currency")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<CurrencyRecord>>>() {})

        assertThat(response!!.body).extracting("name").containsExactly("USD", "EUR")
    }

    @Test
    fun `listReference - filters by name mask`() {
        withTenant {
            currencyRepository.save(Currency(name = "USD", crypto = false))
            currencyRepository.save(Currency(name = "BTC", crypto = true))
        }

        val response = restClient.get()
            .uri("/api/v1/currency/reference?mask=usd")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<Reference>>>() {})

        assertThat(response!!.body).extracting("name").containsExactly("USD")
    }

    @Test
    fun `byId - returns a single currency`() {
        val currency = withTenant { currencyRepository.save(Currency(name = "USD", crypto = false)) }

        val response = restClient.get()
            .uri("/api/v1/currency/${currency.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<CurrencyRecord>>() {})

        assertThat(response!!.body!!.name).isEqualTo("USD")
    }

    @Test
    fun `update - creates a new currency when the record has no id`() {
        val response = restClient.post()
            .uri("/api/v1/currency")
            .headers { it.addAll(authHeaders()) }
            .body(CurrencyRecord(id = null, name = "EUR", crypto = false))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        withTenant { assertThat(currencyRepository.findAll()).extracting("name").containsExactly("EUR") }
    }

    @Test
    fun `update - modifies an existing currency in place`() {
        val currency = withTenant { currencyRepository.save(Currency(name = "Old", crypto = false)) }

        restClient.post()
            .uri("/api/v1/currency")
            .headers { it.addAll(authHeaders()) }
            .body(CurrencyRecord(id = currency.id, name = "New", crypto = true))
            .retrieve()
            .toEntity(String::class.java)

        withTenant {
            val updated = currencyRepository.find(currency.id!!)
            assertThat(updated.name).isEqualTo("New")
            assertThat(updated.crypto).isTrue()
        }
    }

    @Test
    fun `delete - removes the currency`() {
        val currency = withTenant { currencyRepository.save(Currency(name = "EUR", crypto = false)) }

        val response = restClient.delete()
            .uri("/api/v1/currency/${currency.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        withTenant { assertThat(currencyRepository.findById(currency.id!!)).isEmpty() }
    }
}
