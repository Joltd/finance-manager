package com.evgenltd.financemanager.pricing.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.entity.PricingSurvey
import com.evgenltd.financemanager.pricing.record.PricingItemRecord
import com.evgenltd.financemanager.pricing.record.PricingOrderDefaults
import com.evgenltd.financemanager.pricing.record.PricingOrderRecord
import com.evgenltd.financemanager.pricing.record.PricingSurveyProgress
import com.evgenltd.financemanager.pricing.record.PricingSurveyRecord
import com.evgenltd.financemanager.pricing.record.PricingSurveySummary
import com.evgenltd.financemanager.pricing.repository.PricingItemRepository
import com.evgenltd.financemanager.pricing.repository.PricingOrderRepository
import com.evgenltd.financemanager.pricing.repository.PricingSurveyRepository
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpStatus
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

class PricingSurveyControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var pricingItemRepository: PricingItemRepository

    @Autowired
    private lateinit var pricingOrderRepository: PricingOrderRepository

    @Autowired
    private lateinit var pricingSurveyRepository: PricingSurveyRepository

    private lateinit var milk: PricingItem
    private lateinit var bread: PricingItem

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        pricingOrderRepository.deleteAll() // PricingOrder has FKs to PricingItem and PricingSurvey
        pricingSurveyRepository.deleteAll()
        pricingItemRepository.deleteAll()
        milk = pricingItemRepository.save(PricingItem(id = null, name = "Milk", category = "Food", unit = "L", defaultQuantity = BigDecimal.ONE))
        bread = pricingItemRepository.save(PricingItem(id = null, name = "Bread", category = "Bakery", unit = "pcs", defaultQuantity = BigDecimal.ONE))
    }

    private fun survey(country: String = "Georgia", createdAt: LocalDateTime = LocalDateTime.of(2024, 1, 15, 10, 0)) =
        pricingSurveyRepository.save(PricingSurvey(id = null, country = country, city = "Tbilisi", currency = "GEL", createdAt = createdAt))

    private fun order(
        survey: PricingSurvey?,
        item: PricingItem = milk,
        date: LocalDate = LocalDate.of(2024, 1, 15),
        store: String = "Carrefour",
    ) = pricingOrderRepository.save(
        PricingOrder(
            id = null,
            date = date,
            item = item,
            price = Amount(50_000L, "GEL"),
            quantity = BigDecimal.ONE,
            rate = null,
            priceUsd = Amount(0, "USD"),
            country = survey?.country ?: "Montenegro",
            city = survey?.city ?: "Budva",
            store = store,
            comment = null,
            createdAt = date.atTime(10, 0),
            survey = survey,
        ),
    )

    private fun orderRecord(survey: PricingSurvey?, country: String, city: String) = PricingOrderRecord(
        id = null,
        date = LocalDate.of(2024, 1, 15),
        item = PricingItemRecord(id = milk.id, name = milk.name, category = milk.category, unit = milk.unit, defaultQuantity = milk.defaultQuantity),
        price = Amount(50_000L, "GEL"),
        quantity = BigDecimal.ONE,
        country = country,
        city = city,
        store = "Carrefour",
        comment = null,
        survey = survey?.let { PricingSurveyRecord(id = it.id, country = it.country, city = it.city, currency = it.currency) },
    )

    @Test
    fun `list - returns surveys newest first with their progress and period`() {
        val older = survey("Georgia", LocalDateTime.of(2024, 1, 15, 10, 0))
        survey("Armenia", LocalDateTime.of(2024, 2, 15, 10, 0))
        order(older, milk, LocalDate.of(2024, 1, 15))
        order(older, milk, LocalDate.of(2024, 1, 20), store = "Spar")
        order(null, bread)

        val response = restClient.get()
            .uri("/api/v1/pricing/survey")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<PricingSurveySummary>>>() {})

        val body = response!!.body!!
        assertThat(body).extracting<String> { it.survey.country }.containsExactly("Armenia", "Georgia")
        assertThat(body).extracting("filled").containsExactly(0, 1)
        assertThat(body).extracting("total").containsExactly(2, 2)
        assertThat(body[1].dateFrom).isEqualTo(LocalDate.of(2024, 1, 15))
        assertThat(body[1].dateTo).isEqualTo(LocalDate.of(2024, 1, 20))
        assertThat(body[0].dateFrom).isNull()
    }

    @Test
    fun `byId - returns a single survey`() {
        val saved = survey()

        val response = restClient.get()
            .uri("/api/v1/pricing/survey/${saved.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<PricingSurveyRecord>>() {})

        assertThat(response!!.body!!.currency).isEqualTo("GEL")
    }

    @Test
    fun `progress - counts only the orders of the requested survey`() {
        val saved = survey()
        order(saved, milk)
        order(survey("Armenia"), bread)
        order(null, bread)

        val response = restClient.get()
            .uri("/api/v1/pricing/survey/${saved.id}/progress")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<PricingSurveyProgress>>() {})

        val body = response!!.body!!
        assertThat(body.filled).isEqualTo(1)
        assertThat(body.total).isEqualTo(2)
        assertThat(body.categories).extracting("category").containsExactly("Bakery", "Food")
        assertThat(body.categories).extracting("filled").containsExactly(0, 1)
        assertThat(body.categories[1].items[0].price).isEqualTo(Amount(50_000L, "GEL"))
    }

    @Test
    fun `update - creates a new survey`() {
        val response = restClient.post()
            .uri("/api/v1/pricing/survey")
            .headers { it.addAll(authHeaders()) }
            .body(PricingSurveyRecord(id = null, country = "Georgia", city = "Tbilisi", currency = "GEL"))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(pricingSurveyRepository.findAll()).extracting("city").containsExactly("Tbilisi")
    }

    @Test
    fun `update - moves the survey orders to the new location`() {
        val saved = survey()
        val linked = order(saved)
        val standalone = order(null, bread)

        restClient.post()
            .uri("/api/v1/pricing/survey")
            .headers { it.addAll(authHeaders()) }
            .body(PricingSurveyRecord(id = saved.id, country = "Armenia", city = "Yerevan", currency = "AMD"))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(pricingOrderRepository.findById(linked.id!!).get().city).isEqualTo("Yerevan")
        assertThat(pricingOrderRepository.findById(standalone.id!!).get().city).isEqualTo("Budva")
    }

    @Test
    fun `delete - removes the survey and keeps its orders detached`() {
        val saved = survey()
        val linked = order(saved)

        val response = restClient.delete()
            .uri("/api/v1/pricing/survey/${saved.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(pricingSurveyRepository.findById(saved.id!!)).isEmpty()
        assertThat(pricingOrderRepository.findById(linked.id!!).get().survey).isNull()
    }

    @Test
    fun `order update - a new survey order takes its location from the survey`() {
        val saved = survey()

        val response = restClient.post()
            .uri("/api/v1/pricing/order")
            .headers { it.addAll(authHeaders()) }
            .body(orderRecord(saved, country = "Wrong", city = "Wrong"))
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<PricingOrderRecord>>() {})

        val body = response!!.body!!
        assertThat(body.survey!!.id).isEqualTo(saved.id)
        assertThat(body.country).isEqualTo("Georgia")
        assertThat(body.city).isEqualTo("Tbilisi")
    }

    @Test
    fun `order update - an existing survey order keeps its survey and location`() {
        val saved = survey()
        val linked = order(saved)

        val response = restClient.post()
            .uri("/api/v1/pricing/order")
            .headers { it.addAll(authHeaders()) }
            .body(orderRecord(null, country = "Wrong", city = "Wrong").copy(id = linked.id, store = "Spar"))
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<PricingOrderRecord>>() {})

        val body = response!!.body!!
        assertThat(body.survey!!.id).isEqualTo(saved.id)
        assertThat(body.country).isEqualTo("Georgia")
        assertThat(body.store).isEqualTo("Spar")
    }

    @Test
    fun `order defaults - take the location and currency from the survey and the store from its last order`() {
        val saved = survey()
        order(saved, milk, LocalDate.of(2024, 1, 15), store = "Carrefour")
        order(saved, bread, LocalDate.of(2024, 1, 16), store = "Spar")
        order(null, bread, LocalDate.of(2024, 3, 1), store = "Voli")

        val response = restClient.get()
            .uri("/api/v1/pricing/order/defaults?survey=${saved.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<PricingOrderDefaults>>() {})

        val body = response!!.body!!
        assertThat(body.country).isEqualTo("Georgia")
        assertThat(body.city).isEqualTo("Tbilisi")
        assertThat(body.currency).isEqualTo("GEL")
        assertThat(body.store).isEqualTo("Spar")
        assertThat(body.date).isEqualTo(LocalDate.now())
    }
}
