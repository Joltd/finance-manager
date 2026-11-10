package com.evgenltd.financemanager.pricing.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.pricing.converter.PricingItemConverter
import com.evgenltd.financemanager.pricing.converter.PricingSurveyConverter
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.entity.PricingSurvey
import com.evgenltd.financemanager.pricing.record.PricingSurveyRecord
import com.evgenltd.financemanager.pricing.record.PricingSurveyStats
import com.evgenltd.financemanager.pricing.repository.PricingItemRepository
import com.evgenltd.financemanager.pricing.repository.PricingOrderRepository
import com.evgenltd.financemanager.pricing.repository.PricingSurveyRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.domain.Sort
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Optional
import java.util.UUID

class PricingSurveyServiceTest {

    private val pricingSurveyRepository = mock<PricingSurveyRepository>()
    private val pricingItemRepository = mock<PricingItemRepository>()
    private val pricingOrderRepository = mock<PricingOrderRepository>()
    private val service = PricingSurveyService(
        pricingSurveyRepository,
        PricingSurveyConverter(),
        pricingItemRepository,
        PricingItemConverter(),
        pricingOrderRepository,
    )

    private fun survey(country: String = "Georgia", city: String = "Tbilisi") = PricingSurvey(
        id = UUID.randomUUID(),
        country = country,
        city = city,
        currency = "GEL",
        createdAt = LocalDateTime.of(2024, 1, 15, 10, 0),
    )

    private fun item(name: String, category: String = "Food") =
        PricingItem(id = UUID.randomUUID(), name = name, category = category, unit = "L", defaultQuantity = BigDecimal.ONE)

    private fun order(survey: PricingSurvey, item: PricingItem, date: LocalDate, price: Long = 50_000L) = PricingOrder(
        id = UUID.randomUUID(),
        date = date,
        item = item,
        price = Amount(price, "GEL"),
        quantity = BigDecimal.ONE,
        rate = null,
        priceUsd = Amount(0, "USD"),
        country = survey.country,
        city = survey.city,
        store = "Carrefour",
        comment = null,
        createdAt = date.atStartOfDay(),
        survey = survey,
    )

    @Test
    fun `list - combines surveys with order stats and the total item count`() {
        val filled = survey()
        val empty = survey("Armenia", "Yerevan")
        whenever(pricingItemRepository.count()).thenReturn(4)
        whenever(pricingSurveyRepository.findAll(any<Sort>())).thenReturn(listOf(filled, empty))
        whenever(pricingOrderRepository.findSurveyStats()).thenReturn(
            listOf(PricingSurveyStats(filled.id!!, LocalDate.of(2024, 1, 15), LocalDate.of(2024, 1, 20), 3)),
        )

        val result = service.list()

        assertThat(result).extracting("filled").containsExactly(3, 0)
        assertThat(result).extracting("total").containsExactly(4, 4)
        assertThat(result[0].dateFrom).isEqualTo(LocalDate.of(2024, 1, 15))
        assertThat(result[0].dateTo).isEqualTo(LocalDate.of(2024, 1, 20))
        assertThat(result[1].dateFrom).isNull()
    }

    @Test
    fun `progress - groups all items by category and marks the ones having orders`() {
        val survey = survey()
        val milk = item("Milk")
        val bread = item("Bread")
        val soap = item("Soap", "Household")
        whenever(pricingSurveyRepository.findById(survey.id!!)).thenReturn(Optional.of(survey))
        whenever(pricingItemRepository.findAll(any<Sort>())).thenReturn(listOf(bread, milk, soap))
        whenever(pricingOrderRepository.findBySurveyOrderByCreatedAt(survey)).thenReturn(
            listOf(
                order(survey, milk, LocalDate.of(2024, 1, 15), 40_000L),
                order(survey, milk, LocalDate.of(2024, 1, 20), 45_000L),
            ),
        )

        val result = service.progress(survey.id!!)

        assertThat(result.filled).isEqualTo(1)
        assertThat(result.total).isEqualTo(3)
        assertThat(result.dateFrom).isEqualTo(LocalDate.of(2024, 1, 15))
        assertThat(result.dateTo).isEqualTo(LocalDate.of(2024, 1, 20))
        assertThat(result.categories).extracting("category").containsExactly("Food", "Household")
        assertThat(result.categories).extracting("filled").containsExactly(1, 0)
        assertThat(result.categories).extracting("total").containsExactly(2, 1)

        val food = result.categories[0].items
        assertThat(food).extracting("filled").containsExactly(false, true)
        assertThat(food[1].price).isEqualTo(Amount(45_000L, "GEL"))
    }

    @Test
    fun `update - creates a new survey when the record has no id`() {
        whenever(pricingSurveyRepository.save(any<PricingSurvey>())).thenAnswer { it.arguments[0] as PricingSurvey }
        whenever(pricingOrderRepository.findBySurveyOrderByCreatedAt(any())).thenReturn(emptyList())

        val result = service.update(PricingSurveyRecord(id = null, country = "Georgia", city = "Tbilisi", currency = "GEL"))

        assertThat(result.country).isEqualTo("Georgia")
        assertThat(result.currency).isEqualTo("GEL")
    }

    @Test
    fun `update - propagates the changed location to the survey orders`() {
        val survey = survey()
        val existing = order(survey, item("Milk"), LocalDate.of(2024, 1, 15))
        whenever(pricingSurveyRepository.findById(survey.id!!)).thenReturn(Optional.of(survey))
        whenever(pricingSurveyRepository.save(any<PricingSurvey>())).thenAnswer { it.arguments[0] as PricingSurvey }
        whenever(pricingOrderRepository.findBySurveyOrderByCreatedAt(survey)).thenReturn(listOf(existing))

        service.update(PricingSurveyRecord(id = survey.id, country = "Armenia", city = "Yerevan", currency = "AMD"))

        assertThat(existing.country).isEqualTo("Armenia")
        assertThat(existing.city).isEqualTo("Yerevan")
        assertThat(existing.price.currency).isEqualTo("GEL")
        verify(pricingOrderRepository).saveAll(listOf(existing))
    }

    @Test
    fun `delete - detaches the orders and removes the survey`() {
        val survey = survey()
        val existing = order(survey, item("Milk"), LocalDate.of(2024, 1, 15))
        whenever(pricingSurveyRepository.findById(survey.id!!)).thenReturn(Optional.of(survey))
        whenever(pricingOrderRepository.findBySurveyOrderByCreatedAt(survey)).thenReturn(listOf(existing))

        service.delete(survey.id!!)

        assertThat(existing.survey).isNull()
        verify(pricingOrderRepository).saveAll(listOf(existing))
        verify(pricingSurveyRepository).delete(survey)
    }
}
