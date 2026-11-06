package com.evgenltd.financemanager.pricing.service

import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.pricing.converter.PricingOrderConverter
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.repository.PricingOrderRepository
import com.evgenltd.financemanager.settings.service.SettingService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

class PricingOrderServiceTest {

    private val pricingOrderRepository = mock<PricingOrderRepository>()
    private val exchangeRateService = mock<ExchangeRateService>()
    private val service = PricingOrderService(
        pricingOrderRepository,
        mock<PricingOrderConverter>(),
        mock<SettingService>(),
        exchangeRateService,
    )

    // 2026-01-12 is a Monday, 2026-01-14 falls into the same week
    private val week = LocalDate.of(2026, 1, 12)

    private val milk = PricingItem(id = UUID.randomUUID(), name = "Milk", category = "Dairy", unit = "L", defaultQuantity = BigDecimal.ONE)

    private fun order(price: String, currency: String, quantity: String = "1") = PricingOrder(
        id = UUID.randomUUID(),
        date = LocalDate.of(2026, 1, 14),
        item = milk,
        price = fromFractionalString(price, currency),
        quantity = BigDecimal(quantity),
        rate = null,
        priceUsd = Amount(0, "USD"),
        country = "Montenegro",
        city = "Budva",
        store = "Voli",
        comment = null,
        createdAt = LocalDateTime.now(),
    )

    @Test
    fun `updateUsdPrice - stores the rate and the USD price normalized to the default quantity`() {
        val usdOrder = order("3", "USD", quantity = "0.5")
        val eurOrder = order("8", "EUR", quantity = "2")
        val rsdOrder = order("100", "RSD")
        val invalidQuantityOrder = order("3", "USD", quantity = "0")
        whenever(pricingOrderRepository.findByRateIsNull()).thenReturn(listOf(usdOrder, eurOrder, rsdOrder, invalidQuantityOrder))
        // EUR rate is the amount of EUR per 1 USD, RSD has no rate for the week yet
        whenever(exchangeRateService.historyRates(any(), any())).thenReturn(mapOf(week to mapOf("EUR" to BigDecimal("0.8"))))

        service.updateUsdPrice()

        verify(exchangeRateService).historyRates(eq(Range(week, week.plusWeeks(1))), eq(listOf("EUR", "RSD")))
        val captor = argumentCaptor<List<PricingOrder>>()
        verify(pricingOrderRepository).saveAll(captor.capture())
        assertThat(captor.firstValue).containsExactly(usdOrder, eurOrder)

        assertThat(usdOrder.rate).isEqualByComparingTo("1")
        assertThat(usdOrder.priceUsd).isEqualTo(fromFractionalString("6", "USD"))

        assertThat(eurOrder.rate).isEqualByComparingTo("1.25")
        assertThat(eurOrder.priceUsd).isEqualTo(fromFractionalString("5", "USD"))

        assertThat(rsdOrder.rate).isNull()
        assertThat(rsdOrder.priceUsd).isEqualTo(Amount(0, "USD"))
        assertThat(invalidQuantityOrder.rate).isNull()
    }

    @Test
    fun `updateUsdPrice - does not request exchange rates for USD-only orders`() {
        val usdOrder = order("3", "USD")
        whenever(pricingOrderRepository.findByRateIsNull()).thenReturn(listOf(usdOrder))

        service.updateUsdPrice()

        verify(exchangeRateService, never()).historyRates(any(), any())
        assertThat(usdOrder.priceUsd).isEqualTo(fromFractionalString("3", "USD"))
    }

    @Test
    fun `updateUsdPrice - does nothing when every order already has a rate`() {
        whenever(pricingOrderRepository.findByRateIsNull()).thenReturn(emptyList())

        service.updateUsdPrice()

        verify(pricingOrderRepository, never()).saveAll(any<List<PricingOrder>>())
    }

}
