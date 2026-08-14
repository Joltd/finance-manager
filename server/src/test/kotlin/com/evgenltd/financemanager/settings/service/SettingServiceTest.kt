package com.evgenltd.financemanager.settings.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Currency
import com.evgenltd.financemanager.account.repository.CurrencyRepository
import com.evgenltd.financemanager.settings.entity.Setting
import com.evgenltd.financemanager.settings.entity.Settings
import com.evgenltd.financemanager.settings.converter.SettingConverter
import com.evgenltd.financemanager.settings.repository.SettingRepository
import jakarta.persistence.EntityManager
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID

class SettingServiceTest {

    private val settingRepository = mock<SettingRepository>()
    private val currencyRepository = mock<CurrencyRepository>()
    private val entityManager = mock<EntityManager>()
    private val service = SettingService(settingRepository, mock<SettingConverter>(), currencyRepository, entityManager, "3.0")

    @Test
    fun `load - always uses the injected version, regardless of stored settings`() {
        whenever(settingRepository.findAll()).thenReturn(emptyList())

        assertThat(service.load().version).isEqualTo("3.0")
    }

    @Test
    fun `load - maps a boolean setting by name`() {
        whenever(settingRepository.findAll()).thenReturn(listOf(Setting(name = "pricing.feature", value = "true")))

        assertThat(service.load().pricingFeature).isTrue()
    }

    @Test
    fun `load - maps an int setting by name`() {
        whenever(settingRepository.findAll()).thenReturn(listOf(Setting(name = "operation.default.currency.scale", value = "2")))

        assertThat(service.load().operationDefaultCurrencyScale).isEqualTo(2)
    }

    @Test
    fun `load - resolves a currency setting through the currency repository`() {
        val usd = Currency(id = UUID.randomUUID(), name = "USD", crypto = false)
        whenever(settingRepository.findAll()).thenReturn(listOf(Setting(name = "operation.default.currency", value = "USD")))
        whenever(currencyRepository.findByName("USD")).thenReturn(usd)

        assertThat(service.load().operationDefaultCurrency).isSameAs(usd)
    }

    @Test
    fun `load - resolves an account setting through the entity manager`() {
        val accountId = UUID.randomUUID()
        val account = Account(id = accountId, name = "Bank", type = AccountType.ACCOUNT)
        whenever(settingRepository.findAll()).thenReturn(listOf(Setting(name = "operation.default.account", value = accountId.toString())))
        whenever(entityManager.find(Account::class.java, accountId)).thenReturn(account)

        assertThat(service.load().operationDefaultAccount).isSameAs(account)
    }

    @Test
    fun `load - a setting with no stored row is left null`() {
        whenever(settingRepository.findAll()).thenReturn(emptyList())

        assertThat(service.load().pricingFeature).isNull()
    }

    @Test
    fun `update - persists a changed boolean setting as its string value`() {
        whenever(settingRepository.findAll()).thenReturn(emptyList())
        val captor = argumentCaptor<List<Setting>>()
        whenever(settingRepository.saveAll(captor.capture())).thenReturn(emptyList())

        service.update(Settings(pricingFeature = true))

        assertThat(captor.firstValue).extracting("name", "value")
            .contains(org.assertj.core.groups.Tuple.tuple("pricing.feature", "true"))
    }

    @Test
    fun `update - persists an account setting as its id string`() {
        val accountId = UUID.randomUUID()
        whenever(settingRepository.findAll()).thenReturn(emptyList())
        val captor = argumentCaptor<List<Setting>>()
        whenever(settingRepository.saveAll(captor.capture())).thenReturn(emptyList())

        service.update(Settings(operationDefaultAccount = Account(id = accountId, name = "Bank", type = AccountType.ACCOUNT)))

        assertThat(captor.firstValue).extracting("name", "value")
            .contains(org.assertj.core.groups.Tuple.tuple("operation.default.account", accountId.toString()))
    }

    @Test
    fun `update - a setting whose value is unchanged is not included in the save batch`() {
        whenever(settingRepository.findAll()).thenReturn(listOf(Setting(name = "pricing.feature", value = "true")))
        val captor = argumentCaptor<List<Setting>>()
        whenever(settingRepository.saveAll(captor.capture())).thenReturn(emptyList())

        service.update(Settings(pricingFeature = true))

        assertThat(captor.firstValue).extracting("name").doesNotContain("pricing.feature")
    }
}
