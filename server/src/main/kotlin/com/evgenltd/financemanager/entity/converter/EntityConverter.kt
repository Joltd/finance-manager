package com.evgenltd.financemanager.entity.converter

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.entity.record.EntityFieldRecord
import com.evgenltd.financemanager.entity.record.EntityFieldType
import com.evgenltd.financemanager.entity.record.EntityRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.CurrencyRepository
import jakarta.persistence.metamodel.Attribute
import jakarta.persistence.metamodel.EmbeddableType
import jakarta.persistence.metamodel.EntityType
import jakarta.persistence.metamodel.ManagedType
import jakarta.persistence.metamodel.SingularAttribute
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import org.springframework.stereotype.Service
import java.lang.reflect.Field
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*
import kotlin.reflect.KProperty1
import kotlin.reflect.full.declaredMemberProperties
import kotlin.reflect.full.memberProperties

@Service
class EntityConverter(
    private val currencyRepository: CurrencyRepository,
) {

    fun toRecord(entity: EntityRecord, value: Any): Map<String,Any?> = entity.fields
        .filter { it.attributes.size == 1 }
        .associate { it.name to it.toValue(value) }

    private fun EntityFieldRecord.toValue(value: Any): Any? = if (type == EntityFieldType.REFERENCE) {
        (attributes.last().javaMember as Field).get(value).let { toReferenceValue(it) }
    } else {
        (attributes.last().javaMember as Field).get(value)
    }

    fun toReferenceValue(value: Any): Reference {
        val properties = value::class.memberProperties
        val id = properties.first { it.name == "id" }.getter.call(value)
        val name = (properties.firstOrNull { it.name == "name" }?.getter?.call(value) ?: id).toString()
        val deleted = (properties.firstOrNull { it.name == "deleted" }?.getter?.call(value) ?: false) as Boolean
        return Reference(
            id = id as UUID,
            name = name,
            deleted = deleted
        )
    }

    fun toEntity(type: EntityType<*>): EntityRecord {
        val fields = type.javaType.kotlin.declaredMemberProperties.associateBy { it.name }
        return EntityRecord(
            type,
            type.name,
            type.name,
            type.singularAttributes
                .flatMap { toField(it, fields[it.name]!!) }
        )
    }

    private fun toField(attribute: SingularAttribute<*, *>, field: KProperty1<out Any, *>): List<EntityFieldRecord> {
        if (attribute.isId) {
            return listOf(EntityFieldRecord(
                attributes = listOf(attribute),
                name = attribute.name,
                type = EntityFieldType.ID,
            ))
        }

        if (attribute.persistentAttributeType == Attribute.PersistentAttributeType.BASIC) {

            if (attribute.javaType.isEnum) {
                return listOf(EntityFieldRecord(
                    attributes = listOf(attribute),
                    name = attribute.name,
                    type = EntityFieldType.ENUM,
                    nullable = field.returnType.isMarkedNullable,
                    enumConstants = attribute.javaType.enumConstants.toList()
                ))
            }

            return listOf(EntityFieldRecord(
                attributes = listOf(attribute),
                name = attribute.name,
                type = determineFieldType(attribute),
                nullable = field.returnType.isMarkedNullable,
            ))
        }

        if (attribute.persistentAttributeType == Attribute.PersistentAttributeType.MANY_TO_ONE) {
            val type = attribute.type as EntityType
            return toManagedField(attribute, field, type, EntityFieldType.REFERENCE, type.name)
        }

        if (attribute.persistentAttributeType == Attribute.PersistentAttributeType.EMBEDDED) {
            val type = attribute.type
            if (type is EmbeddableType) {
                if (type.javaType == Amount::class.java) {
                    return toManagedField(attribute, field, type, EntityFieldType.AMOUNT)
                        .map { managedField ->
                            managedField.takeIf { it.attributes.last().name == "currency" }
                                ?.copy(
                                    type = EntityFieldType.ENUM,
                                    enumConstants = currencyRepository.findAll().map { it.name }
                                )
                                ?: managedField
                        }
                }
            }
        }

        throw IllegalStateException("Unknown attribute type ${attribute.persistentAttributeType}")
    }

    private fun toManagedField(
        attribute: SingularAttribute<*, *>,
        field: KProperty1<out Any, *>,
        type: ManagedType<*>,
        fieldType: EntityFieldType,
        referenceName: String? = null,
    ): List<EntityFieldRecord> {
        val fields = type.javaType.kotlin.declaredMemberProperties.associateBy { it.name }
        val subFields = type.singularAttributes
            .flatMap { toField(it, fields[it.name]!!) }
            .map {
                it.copy(
                    attributes = listOf(attribute) + it.attributes,
                    name = "${attribute.name}.${it.name}",
                    subField = true,
                )
            }
        return listOf(EntityFieldRecord(
            attributes = listOf(attribute),
            name = attribute.name,
            type = fieldType,
            nullable = field.returnType.isMarkedNullable,
            referenceName = referenceName,
        )) + subFields
    }

    private fun determineFieldType(attribute: SingularAttribute<*, *>): EntityFieldType {
        val attributeType = attribute.javaType
        val attributeField = attribute.javaMember as? Field

        return if (attributeType in listOf(String::class.java, UUID::class.java)) {
            EntityFieldType.STRING
        } else if (attributeType in listOf(
                Long::class.java,
                Int::class.java,
                BigDecimal::class.java,
                Double::class.java,
                Float::class.java
            )
        ) {
            EntityFieldType.NUMBER
        } else if (attributeType == Boolean::class.java) {
            EntityFieldType.BOOLEAN
        } else if (attributeType in listOf(LocalDate::class.java, LocalDateTime::class.java)) {
            EntityFieldType.DATE
        } else if (attributeField?.getDeclaredAnnotation(JdbcTypeCode::class.java)?.value == SqlTypes.JSON) {
            EntityFieldType.JSON
        } else {
            throw IllegalStateException("Unknown type ${attribute.type.javaType}")
        }
    }


}