package com.evgenltd.financemanager.entity.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.entity.record.*
import com.evgenltd.financemanager.reference.record.Reference
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.treeToValue
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
import kotlin.reflect.KProperty1
import kotlin.reflect.full.declaredMemberProperties
import kotlin.reflect.full.memberProperties

@Service
class EntityService(
    private val entityManager: EntityManager,
    private val mapper: ObjectMapper,
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

    fun referenceList(name: String, mask: String?, id: UUID?): List<Reference> {
        val entity = entities.first { it.name == name }

        val cb = entityManager.criteriaBuilder
        val query = cb.createQuery()
        val root = query.from(entity.type)

        return entityManager.createQuery(query)
            .resultList
            .map { toReferenceValue(it) }
    }

    fun list(name: String, request: EntityListRequest): EntityListPage {
        val entity = entities.first { it.name == name }

        val cb = entityManager.criteriaBuilder
        val query = cb.createQuery()
        val root = query.from(entity.type)

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
        countQuery.select(cb.count(countQuery.from(entity.type)))
//        countQuery.where()
        if (sort.isNotEmpty()) {
            query.orderBy(sort)
        }
        val count = entityManager.createQuery(countQuery).singleResult

        val result = entityManager.createQuery(query)
            .setFirstResult(request.page * request.size)
            .setMaxResults(request.size)
            .resultList
            .map { toRecord(entity, it) }

        return EntityListPage(
            total = count,
            page = request.page,
            size = request.size,
            values = result
        )
    }

    fun byId(name: String, id: UUID): Map<String,Any?> {
        val entity = entities.first { it.name == name }

        val cb = entityManager.criteriaBuilder
        val query = cb.createQuery()
        val root = query.from(entity.type)
        query.where(cb.equal(root.get<Any>("id"), id))

        return entityManager.createQuery(query)
            .singleResult
            .let { toRecord(entity, it) }
    }

    @Transactional
    fun update(name: String, value: String) {
        val entity = entities.first { it.name == name }

        val valueNode = mapper.readTree(value)
        val entityValue = entity.type.javaType.getDeclaredConstructor().newInstance()

        var isNew = false
        for (field in entity.fields) {

            if (!valueNode.has(field.name)) {
                continue
            }

            var fieldValueNode = valueNode.get(field.name)
            val declaredField = entity.type.javaType.getDeclaredField(field.name)
            declaredField.trySetAccessible()

            if (fieldValueNode.isNull) {
                declaredField.set(entityValue, null)
                if (field.type == EntityFieldType.ID) {
                    isNew = true
                }
                continue
            }

            if (field.type == EntityFieldType.REFERENCE) {
                val reference = mapper.treeToValue<Reference>(fieldValueNode)
                val referenceValue = entityManager.find(field.attribute.javaType, reference.id)
                declaredField.set(entityValue, referenceValue)
                continue
            }

            declaredField.set(entityValue, mapper.treeToValue(fieldValueNode, field.attribute.javaType))
        }

        if (isNew) {
            entityManager.persist(entityValue)
        } else {
            entityManager.merge(entityValue)
        }
    }

    @Transactional
    fun delete(name: String, id: UUID) {
        val entity = entities.first { it.name == name }
        val cb = entityManager.criteriaBuilder
        val query = cb.createCriteriaDelete(entity.type.javaType as Class<Any>)
        val root = query.from(entity.type.javaType as Class<Any>)
        query.where(cb.equal(root.get<Any>("id"), id))
        entityManager.createQuery(query).executeUpdate()
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

    private fun toRecord(entity: EntityRecord, value: Any): Map<String,Any?> = entity.fields
        .associate { it.name to toValue(it, value) }

    private fun toValue(field: EntityFieldRecord, value: Any): Any? {
        val attributeField = field.attribute.javaMember as Field
        if (field.type == EntityFieldType.REFERENCE) {
            val referenceValue = attributeField.get(value)
            return toReferenceValue(referenceValue)
        }

        return attributeField.get(value)
    }

    private fun toReferenceValue(value: Any): Reference {
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

    private fun toEntity(type: EntityType<*>): EntityRecord {
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

            val attributeType = attribute.javaType
            val attributeField = attribute.javaMember as? Field

            if (attributeType.isEnum) {
                return EntityFieldRecord(
                    attribute = attribute,
                    name = attribute.name,
                    type = EntityFieldType.ENUM,
                    nullable = field.returnType.isMarkedNullable,
                    enumConstants = attributeType.enumConstants.toList()
                )
            }

            val type = if (attributeType in listOf(String::class.java, UUID::class.java)) {
                EntityFieldType.STRING
            } else if (attributeType in listOf(Long::class.java, Int::class.java, BigDecimal::class.java, Double::class.java, Float::class.java)) {
                EntityFieldType.NUMBER
            } else if (attributeType == Boolean::class.java) {
                EntityFieldType.BOOLEAN
            } else if (attributeType == LocalDate::class.java) {
                EntityFieldType.DATE
            } else if (attributeField?.getDeclaredAnnotation(JdbcTypeCode::class.java)?.value == SqlTypes.JSON) {
                EntityFieldType.JSON
            } else {
                throw IllegalStateException("Unknown type ${attribute.type.javaType}")
            }

            return EntityFieldRecord(
                attribute = attribute,
                name = attribute.name,
                type = type,
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

}