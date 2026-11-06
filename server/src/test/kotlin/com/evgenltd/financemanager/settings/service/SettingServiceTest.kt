package com.evgenltd.financemanager.settings.service

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.converter.CurrencyConverter
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Currency
import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.account.repository.CurrencyRepository
import com.evgenltd.financemanager.settings.converter.SettingConverter
import com.evgenltd.financemanager.settings.entity.Setting
import com.evgenltd.financemanager.settings.record.SettingsRecord
import com.evgenltd.financemanager.settings.repository.SettingRepository
import jakarta.persistence.EntityManager
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.groups.Tuple.tuple
import org.junit.jupiter.api.Test
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.util.UUID

class SettingServiceTest {

    private val settingRepository = mock<SettingRepository>()
    private val currencyRepository = mock<CurrencyRepository>()
    private val accountConverter = mock<AccountConverter>()
    private val entityManager = mock<EntityManager>()
    private val settingConverter = SettingConverter(CurrencyConverter(currencyRepository), accountConverter)
    private val service = SettingService(settingRepository, settingConverter, currencyRepository, entityManager, "3.0")
    private val emptyRecord = SettingsRecord("3.0", null, null, null, null, null)

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
    fun `updateRecord - ignores changes to the admin pricing feature`() {
        val pricingSetting = Setting(name = "pricing.feature", value = "true")
        whenever(settingRepository.findAll()).thenReturn(listOf(pricingSetting))
        val captor = argumentCaptor<List<Setting>>()
        whenever(settingRepository.saveAll(captor.capture())).thenReturn(emptyList())

        service.updateRecord(emptyRecord.copy(pricingFeature = false))

        assertThat(captor.firstValue).isEmpty()
        assertThat(pricingSetting.value).isEqualTo("true")
    }

    @Test
    fun `updateRecord - persists currency, scale and account defaults`() {
        val bank = AccountReferenceRecord(UUID.randomUUID(), "Bank", false, AccountType.ACCOUNT, null)
        val cash = bank.copy(id = UUID.randomUUID(), name = "Cash")
        whenever(accountConverter.toEntity(bank)).thenReturn(Account(id = bank.id, name = bank.name, type = bank.type))
        whenever(accountConverter.toEntity(cash)).thenReturn(Account(id = cash.id, name = cash.name, type = cash.type))
        whenever(currencyRepository.findByName("USD")).thenReturn(Currency(name = "USD", crypto = false))
        whenever(settingRepository.findAll()).thenReturn(emptyList())
        val captor = argumentCaptor<List<Setting>>()
        whenever(settingRepository.saveAll(captor.capture())).thenReturn(emptyList())

        service.updateRecord(emptyRecord.copy(
            operationDefaultCurrency = "USD",
            operationDefaultCurrencyScale = 2,
            operationDefaultAccount = bank,
            operationCashAccount = cash,
        ))

        assertThat(captor.firstValue).extracting("name", "value")
            .containsExactlyInAnyOrder(
                tuple("operation.default.currency", "USD"),
                tuple("operation.default.currency.scale", "2"),
                tuple("operation.default.account", bank.id.toString()),
                tuple("operation.cash.account", cash.id.toString()),
            )
    }

    @Test
    fun `updateRecord - a setting whose value is unchanged is not included in the save batch`() {
        whenever(settingRepository.findAll()).thenReturn(listOf(Setting(name = "operation.default.currency.scale", value = "2")))
        val captor = argumentCaptor<List<Setting>>()
        whenever(settingRepository.saveAll(captor.capture())).thenReturn(emptyList())

        service.updateRecord(emptyRecord.copy(operationDefaultCurrencyScale = 2))

        assertThat(captor.firstValue).isEmpty()
    }
}
