package com.evgenltd.financemanager.entity.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.entity.record.*
import com.evgenltd.financemanager.reference.record.Reference
import jakarta.annotation.PostConstruct
import jakarta.persistence.EntityManager
import jakarta.persistence.metamodel.Attribute
import jakarta.persistence.metamodel.EntityType
import jakarta.persistence.metamodel.SingularAttribute
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.lang.reflect.Field
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID
import kotlin.reflect.full.memberProperties

@Service
class EntityService(
    private val entityManager: EntityManager
) {

    private lateinit var entities: List<EntityRecord>

    @PostConstruct
    fun postConstruct() {
        entities = entityManager.metamodel
            .entities
            .map { toEntity(it) }
            .toList()
    }

    fun entityList(): List<EntityRecord> = entities.sortedBy { it.name }

    fun list(name: String, request: EntityListRequest): EntityListPage {
        val type = entityManager.metamodel
            .entities
            .first { it.name == name }
        val entity = entities.first { it.name == name }

        val cb = entityManager.criteriaBuilder
        val query = cb.createQuery()
        val root = query.from(type)

        val sort = request.sort
            .map {
                when (it.direction) {
                    SortDirection.ASC -> cb.asc(root.get<Any>(it.field))
                    SortDirection.DESC -> cb.desc(root.get<Any>(it.field))
                }
            }

        if (sort.isNotEmpty()) {
            query.orderBy(sort)
        }

        val countQuery = cb.createQuery(Long::class.java)
        countQuery.select(cb.count(countQuery.from(type)))
//        countQuery.where()
        if (sort.isNotEmpty()) {
            query.orderBy(sort)
        }
        val count = entityManager.createQuery(countQuery).singleResult

        val result = entityManager.createQuery(query)
            .setFirstResult(request.page * request.size)
            .setMaxResults(request.size)
            .resultList
            .map { toRecord(type, entity, it) }

        return EntityListPage(
            total = count,
            page = request.page,
            size = request.size,
            values = result
        )
    }

    fun byId() {

    }

    fun update() {

    }

    @Transactional
    fun delete(name: String, id: UUID) {
        val type = entityManager.metamodel.entities.first { it.name == name }
        val cb = entityManager.criteriaBuilder
        cb.createQuery()
            .let { it.where(cb.equal(it.from(type.javaType).get<UUID>("id"), id)) }
            .let { entityManager.createQuery(it) }
            .singleResult
            .let { entityManager.remove(it) }
    }

//    private fun qwe(field: String, root: Root<*>, cb: CriteriaBuilder, operator: Operator, value: Any): Predicate {
//        return when (operator) {
//            Operator.EQUALS -> cb.equal(root.get<Any>(field), value)
//            Operator.GREATER -> cb.greaterThan<Any>(root.get<Any>(field), value)
//            Operator.LESS -> cb.lessThan(root.get<Any>(field), value)
//            Operator.GREATER_OR_EQUALS -> cb.greaterThanOrEqualTo(root.get<Any>(field), value)
//            Operator.LESS_OR_EQUALS -> cb.lessThanOrEqualTo(root.get<Any>(field), value)
//            Operator.LIKE -> cb.like(root.get<Any>(field), value as String)
//            Operator.IN -> {
//                val inBuilder = cb.`in`(root.get<Any>("test"))
//                val values = value as List<*>
//                for (v in values) {
//                    inBuilder.value(v)
//                }
//                inBuilder
//            }
//        }
//    }

    private fun toRecord(type: EntityType<*>, entity: EntityRecord, value: Any): Map<String,Any?> {
        val fields = entity.fields.associateBy { it.name }
        return type.singularAttributes
            .associate { it.name to toValue(it, fields[it.name]!!, value) }
    }

    private fun toValue(attribute: SingularAttribute<*,*>, field: EntityFieldRecord, value: Any): Any? {
        val attributeField = attribute.javaMember as Field
        if (field.type == EntityFieldType.REFERENCE) {
            val referenceValue = attributeField.get(value)
            return toReferenceValue(referenceValue)
        }

        return attributeField.get(value)
    }

    private fun toReferenceValue(value: Any): Reference {
        val properties = value::class.memberProperties
        val id = properties.first { it.name == "id" }.getter.call(value)
        return Reference(
            id = id as UUID,
            name = (properties.firstOrNull { it.name == "name" }?.getter?.call(value) ?: id).toString(),
            deleted = false
        )
    }

    private fun toEntity(type: EntityType<*>): EntityRecord = EntityRecord(
        type.name,
        type.name,
        type.attributes
            .mapNotNull { it as? SingularAttribute }
            .map { toField(it) }
    )

    private fun toField(attribute: SingularAttribute<*,*>): EntityFieldRecord {
        if (attribute.isId) {
            return EntityFieldRecord(
                name = attribute.name,
                type = EntityFieldType.ID,
                nullable = false,
            )
        }

        if (attribute.persistentAttributeType == Attribute.PersistentAttributeType.BASIC) {
            val attributeType = attribute.javaType
            val attributeField = attribute.javaMember as? Field
            val type = if (attributeType in listOf(String::class.java, UUID::class.java)) {
                EntityFieldType.STRING
            } else if (attributeType in listOf(Long::class.java, Int::class.java, BigDecimal::class.java, Double::class.java, Float::class.java)) {
                EntityFieldType.NUMBER
            } else if (attributeType == Boolean::class.java) {
                EntityFieldType.BOOLEAN
            } else if (attributeType == LocalDate::class.java) {
                EntityFieldType.DATE
            } else if (attributeType.isEnum) {
                EntityFieldType.ENUM
            } else if (attributeField?.getDeclaredAnnotation(JdbcTypeCode::class.java)?.value == SqlTypes.JSON) {
                EntityFieldType.JSON
            } else {
                throw IllegalStateException("Unknown type ${attribute.type.javaType}")
            }

            return EntityFieldRecord(
                name = attribute.name,
                type = type,
                nullable = attribute.isOptional,
            )
        }

        if (attribute.persistentAttributeType == Attribute.PersistentAttributeType.MANY_TO_ONE) {
            return EntityFieldRecord(
                name = attribute.name,
                type = EntityFieldType.REFERENCE,
                nullable = attribute.isOptional,
                referenceName = (attribute.type as? EntityType)?.name,
            )
        }

        if (attribute.persistentAttributeType == Attribute.PersistentAttributeType.EMBEDDED) {
            if (attribute.javaType == Amount::class.java) {
                return EntityFieldRecord(
                    name = attribute.name,
                    type = EntityFieldType.AMOUNT,
                    nullable = attribute.isOptional,
                )
            }
        }

        throw IllegalStateException("Unknown attribute type ${attribute.persistentAttributeType}")
    }

}