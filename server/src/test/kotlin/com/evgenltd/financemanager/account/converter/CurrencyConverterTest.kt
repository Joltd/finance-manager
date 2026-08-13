package com.evgenltd.financemanager.account.converter

import com.evgenltd.financemanager.account.entity.Currency
import com.evgenltd.financemanager.account.record.CurrencyRecord
import com.evgenltd.financemanager.account.repository.CurrencyRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.util.UUID

class CurrencyConverterTest {

    private val currencyRepository = mock<CurrencyRepository>()
    private val converter = CurrencyConverter(currencyRepository)

    @Test
    fun `toRecord - maps entity fields to record`() {
        val entity = Currency(id = UUID.randomUUID(), name = "USD", crypto = false)

        val record = converter.toRecord(entity)

        assertThat(record.id).isEqualTo(entity.id)
        assertThat(record.name).isEqualTo("USD")
        assertThat(record.crypto).isFalse()
    }

    @Test
    fun `toEntity - looks up currency by name`() {
        val entity = Currency(id = UUID.randomUUID(), name = "BTC", crypto = true)
        whenever(currencyRepository.findByName("BTC")).thenReturn(entity)

        assertThat(converter.toEntity("BTC")).isSameAs(entity)
    }

    @Test
    fun `fillEntity - creates a new entity when given null`() {
        val record = CurrencyRecord(id = null, name = "EUR", crypto = false)

        val entity = converter.fillEntity(null, record)

        assertThat(entity.name).isEqualTo("EUR")
        assertThat(entity.crypto).isFalse()
    }

    @Test
    fun `fillEntity - updates an existing entity in place`() {
        val existing = Currency(id = UUID.randomUUID(), name = "Old", crypto = false)
        val record = CurrencyRecord(id = existing.id, name = "New", crypto = true)

        val entity = converter.fillEntity(existing, record)

        assertThat(entity).isSameAs(existing)
        assertThat(entity.name).isEqualTo("New")
        assertThat(entity.crypto).isTrue()
    }

    @Test
    fun `toReference - maps id and name`() {
        val entity = Currency(id = UUID.randomUUID(), name = "USD", crypto = false)

        val reference = converter.toReference(entity)

        assertThat(reference.id).isEqualTo(entity.id)
        assertThat(reference.name).isEqualTo("USD")
    }
}
