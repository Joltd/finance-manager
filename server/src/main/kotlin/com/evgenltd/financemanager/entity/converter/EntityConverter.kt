package com.evgenltd.financemanager.entity.converter

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.entity.record.EntityFieldRecord
import com.evgenltd.financemanager.entity.record.EntityFieldType
import com.evgenltd.financemanager.entity.record.EntityRecord
import com.evgenltd.financemanager.reference.record.Reference
import jakarta.persistence.metamodel.Attribute
import jakarta.persistence.metamodel.EntityType
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
class EntityConverter {

    fun toRecord(entity: EntityRecord, value: Any): Map<String,Any?> = entity.fields
        .associate { it.name to it.toValue(value) }

    private fun EntityFieldRecord.toValue(value: Any): Any? = if (type == EntityFieldType.REFERENCE) {
        (attribute.javaMember as Field).get(value).let { toReferenceValue(it) }
    } else {
        (attribute.javaMember as Field).get(value)
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
            type.attributes
                .mapNotNull { it as? SingularAttribute }
                .map { toField(it, fields[it.name]!!) }
        )
    }

    private fun toField(attribute: SingularAttribute<*, *>, field: KProperty1<out Any, *>): EntityFieldRecord {
        if (attribute.isId) {
            return EntityFieldRecord(
                attribute = attribute,
                name = attribute.name,
                type = EntityFieldType.ID,
                nullable = false,
            )
        }

        if (attribute.persistentAttributeType == Attribute.PersistentAttributeType.BASIC) {

            if (attribute.javaType.isEnum) {
                return EntityFieldRecord(
                    attribute = attribute,
                    name = attribute.name,
                    type = EntityFieldType.ENUM,
                    nullable = field.returnType.isMarkedNullable,
                    enumConstants = attribute.javaType.enumConstants.toList()
                )
            }

            return EntityFieldRecord(
                attribute = attribute,
                name = attribute.name,
                type = determineFieldType(attribute),
                nullable = field.returnType.isMarkedNullable,
            )
        }

        if (attribute.persistentAttributeType == Attribute.PersistentAttributeType.MANY_TO_ONE) {
            return EntityFieldRecord(
                attribute = attribute,
                name = attribute.name,
                type = EntityFieldType.REFERENCE,
                nullable = field.returnType.isMarkedNullable,
                referenceName = (attribute.type as? EntityType)?.name,
            )
        }

        if (attribute.persistentAttributeType == Attribute.PersistentAttributeType.EMBEDDED) {
            if (attribute.javaType == Amount::class.java) {
                return EntityFieldRecord(
                    attribute = attribute,
                    name = attribute.name,
                    type = EntityFieldType.AMOUNT,
                    nullable = field.returnType.isMarkedNullable,
                )
            }
        }

        throw IllegalStateException("Unknown attribute type ${attribute.persistentAttributeType}")
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