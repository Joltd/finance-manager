package com.evgenltd.financemanager.settings.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.Currency
import com.evgenltd.financemanager.account.repository.CurrencyRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.exchangerate.service.provider.Provider
import com.evgenltd.financemanager.settings.converter.SettingConverter
import com.evgenltd.financemanager.settings.entity.Setting
import com.evgenltd.financemanager.settings.entity.Settings
import com.evgenltd.financemanager.settings.entity.SettingName
import com.evgenltd.financemanager.settings.entity.SystemSettings
import com.evgenltd.financemanager.settings.record.SettingsRecord
import com.evgenltd.financemanager.settings.repository.SettingRepository
import jakarta.persistence.Entity
import jakarta.persistence.EntityManager
import jakarta.transaction.NotSupportedException
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.*
import kotlin.reflect.KClass
import kotlin.reflect.KMutableProperty1
import kotlin.reflect.KProperty1
import kotlin.reflect.full.createInstance
import kotlin.reflect.full.declaredMemberProperties
import kotlin.reflect.full.findAnnotation
import kotlin.reflect.full.hasAnnotation
import kotlin.reflect.full.isSubclassOf
import kotlin.reflect.jvm.isAccessible

@Service
@SkipLogging
class SettingService(
    private val settingRepository: SettingRepository,
    private val settingConverter: SettingConverter,
    private val currencyRepository: CurrencyRepository,
    private val entityManager: EntityManager,
    @Value("\${APP_VERSION}") private val version: String
) {

    fun loadSystem(): SystemSettings = settingRepository.findByTenantIsNull().read()

    fun load(): Settings = settingRepository.findAll().read()

    fun loadRecord(): SettingsRecord = load().let { settingConverter.toRecord(it) }

    fun updateSystem(settings: SystemSettings) {
        settingRepository.findByTenantIsNull()
            .update(settings)
            .let { settingRepository.saveAll(it) }
    }

    fun update(settings: Settings) {
        settingRepository.findAll()
            .update(settings)
            .let { settingRepository.saveAll(it) }
    }

    fun updateRecord(settingsRecord: SettingsRecord) {
        val settings = settingConverter.toEntity(settingsRecord)
        update(settings)
    }

    fun operationDefaultCurrency(): String? = throw NotSupportedException()

    fun operationDefaultAccount(): Account? = throw NotSupportedException()

    fun operationCashAccount(): Account? = throw NotSupportedException()

    fun fiatExchangeRateProvider(): Provider? = throw NotSupportedException()

    fun cryptoExchangeRateProvider(): Provider? = throw NotSupportedException()

    //

    private inline fun <reified T : Any> List<Setting>.read(): T {
        val settingIndex = associateBy { it.name }
        val settings = T::class.createInstance()
        for (property in T::class.declaredMemberProperties) {
            if (property !is KMutableProperty1<T, *>) {
                continue
            }

            val value = prepareSettingParameter(property, settingIndex)
            property.isAccessible = true
            property.setter.call(settings, value)
        }
        return settings
    }

    private fun <T> prepareSettingParameter(property: KMutableProperty1<T, *>, settings: Map<String, Setting>): Any? {
        if (property.name == "version") {
            return version
        }

        val settingName = property.findAnnotation<SettingName>()
            ?.name
            ?: throw RuntimeException("Parameter ${property.name} is not annotated with @SettingName")
        val settingValue = settings[settingName]
            ?.value
            ?: return null

        val parameterType = property.returnType.classifier as? KClass<*>
            ?: throw RuntimeException("Parameter ${property.name} type ${property.returnType.classifier} is not supported")

        return when {
            parameterType.isSubclassOf(Enum::class) -> {
                parameterType.java
                    .enumConstants
                    ?.map { it as Enum<*> }
                    ?.firstOrNull { it.name == settingValue }
                    ?: throw RuntimeException("Parameter ${property.name} value $settingValue is unknown enum ${parameterType.java}")
            }
            parameterType == Currency::class -> {
                currencyRepository.findByName(settingValue)
            }
            parameterType.hasAnnotation<Entity>() -> {
                val id = UUID.fromString(settingValue)
                entityManager.find(parameterType.java, id)
            }
            parameterType == Int::class -> settingValue.toInt()
            parameterType == Long::class -> settingValue.toLong()
            parameterType == Double::class -> settingValue.toDouble()
            parameterType == Float::class -> settingValue.toFloat()
            parameterType == Boolean::class -> settingValue.toBoolean()
            else -> {
                settingValue
            }
        }
    }

    private inline fun <reified T : Any> List<Setting>.update(settings: T): List<Setting> {
        val settingIndex = associateBy { it.name }

        return T::class.declaredMemberProperties
            .mapNotNull { property ->
                val settingName = property.findAnnotation<SettingName>()
                    ?.name
                    ?: return@mapNotNull null

                val settingValue = property.get(settings)
                val value = prepareSettingValue(settingValue)

                val setting = settingIndex[settingName] ?: Setting(name = settingName)
                if (setting.value == value) {
                    return@mapNotNull null
                }

                setting.value = value
                setting
            }
    }

    private fun prepareSettingValue(settingValue: Any?): String? = when {
        settingValue == null -> null
        settingValue is Currency -> settingValue.name
        settingValue::class.hasAnnotation<Entity>() -> {
            settingValue::class
                .declaredMemberProperties
                .firstOrNull { it.name == "id" }
                ?.let { it as? KProperty1<Any, *> }
                ?.get(settingValue)
                ?.toString()
        }
        else -> settingValue.toString()
    }

}