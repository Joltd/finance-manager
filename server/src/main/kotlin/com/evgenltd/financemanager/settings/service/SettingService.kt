package com.evgenltd.financemanager.settings.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.Currency
import com.evgenltd.financemanager.account.repository.CurrencyRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.settings.converter.SettingConverter
import com.evgenltd.financemanager.settings.entity.Setting
import com.evgenltd.financemanager.settings.entity.Settings
import com.evgenltd.financemanager.settings.entity.SettingName
import com.evgenltd.financemanager.settings.entity.SystemSettings
import com.evgenltd.financemanager.settings.record.AdminSettingsRecord
import com.evgenltd.financemanager.settings.record.SettingsRecord
import com.evgenltd.financemanager.settings.repository.SettingRepository
import com.evgenltd.financemanager.user.component.currentTenant
import jakarta.persistence.Entity
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
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

    fun load(tenant: UUID): Settings = settingRepository.findByTenant(tenant).read(tenant)

    fun loadRecord(): SettingsRecord = load().let { settingConverter.toRecord(it) }

    fun loadAdminRecord(tenant: UUID): AdminSettingsRecord = settingConverter.toAdminRecord(load(tenant))

    fun updateSystem(settings: SystemSettings) {
        settingRepository.findByTenantIsNull()
            .update(settings)
            .let { settingRepository.saveAll(it) }
    }

    @Transactional
    fun updateRecord(settingsRecord: SettingsRecord) {
        currentTenant()?.let { lockSettings(it) }
        settingRepository.findAll().updateSettings { settingConverter.fillEntity(it, settingsRecord) }
    }

    @Transactional
    fun updateRecord(settingsRecord: AdminSettingsRecord, tenant: UUID): AdminSettingsRecord {
        lockSettings(tenant)
        val settings = settingRepository.findByTenant(tenant)
            .updateSettings(tenant) { settingConverter.fillEntity(it, settingsRecord) }
        return settingConverter.toAdminRecord(settings)
    }

    private fun lockSettings(tenant: UUID) {
        // Serialize updates even when a setting has no row to lock yet.
        entityManager.createNativeQuery("select 1 from pg_advisory_xact_lock(hashtextextended(:key, 0))")
            .setParameter("key", "settings:$tenant")
            .singleResult
    }

    private fun List<Setting>.updateSettings(tenant: UUID? = null, fill: (Settings) -> Unit): Settings {
        val previous = read<Settings>(tenant)
        val settings = previous.copy().also(fill)
        val (removed, saved) = update(settings, tenant, previous).partition { it.value == null }
        if (removed.isNotEmpty()) {
            settingRepository.deleteAll(removed)
        }
        settingRepository.saveAll(saved)
        return settings
    }

    //

    private inline fun <reified T : Any> List<Setting>.read(tenant: UUID? = null): T {
        val settingIndex = associateBy { it.name }
        val settings = T::class.createInstance()
        for (property in T::class.declaredMemberProperties) {
            if (property !is KMutableProperty1<T, *>) {
                continue
            }

            val value = prepareSettingParameter(property, settingIndex, tenant)
            property.isAccessible = true
            property.setter.call(settings, value)
        }
        return settings
    }

    private fun <T> prepareSettingParameter(
        property: KMutableProperty1<T, *>,
        settings: Map<String, Setting>,
        tenant: UUID?,
    ): Any? {
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
                if (tenant == null) {
                    currencyRepository.findByName(settingValue)
                } else {
                    currencyRepository.findByTenantAndName(tenant, settingValue)
                }
            }
            parameterType.hasAnnotation<Entity>() -> {
                val id = UUID.fromString(settingValue)
                entityManager.find(parameterType.java, id)
                    .takeUnless { tenant != null && it is Account && it.tenant != tenant }
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

    private inline fun <reified T : Any> List<Setting>.update(
        settings: T,
        tenant: UUID? = null,
        previous: T? = null,
    ): List<Setting> {
        val settingIndex = associateBy { it.name }

        return T::class.declaredMemberProperties
            .mapNotNull { property ->
                val settingName = property.findAnnotation<SettingName>()
                    ?.name
                    ?: return@mapNotNull null

                val settingValue = property.get(settings)
                if (previous != null && settingValue == property.get(previous)) {
                    return@mapNotNull null
                }
                val value = prepareSettingValue(settingValue)

                val setting = settingIndex[settingName] ?: Setting(name = settingName, tenant = tenant)
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
