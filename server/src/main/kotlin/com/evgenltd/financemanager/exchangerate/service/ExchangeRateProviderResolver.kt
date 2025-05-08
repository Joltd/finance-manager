package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.stereotype.Service

@Service
class ExchangeRateProviderResolver(
    private val settingService: SettingService,
    private val providers: List<ExchangeRateProvider>,
) : Loggable() {

    fun resolveFiat(): ExchangeRateProvider? {
        val provider = settingService.fiatExchangeRateProvider()
        return providers.firstOrNull { it.name == provider }
            .also {
                if (it == null) {
                    log.warn("Fiat exchange provider not found: $provider")
                }
            }
    }

    fun resolveCrypto(): ExchangeRateProvider? {
        val provider = settingService.cryptoExchangeRateProvider()
        return providers.firstOrNull { it.name == provider }
            .also {
                if (it == null) {
                    log.warn("Crypto exchange provider not found: $provider")
                }
            }
    }

}