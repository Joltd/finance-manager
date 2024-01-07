package com.evgenltd.financemanager.entity.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.entity.converter.EntityConverter
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
    private val entityConverter: EntityConverter,
    private val mapper: ObjectMapper,
    private val queryBuilderService: QueryBuilderService,
) {

    private lateinit var entities: List<EntityRecord>

    @PostConstruct
    fun postConstruct() {
        entities = entityManager.metamodel
            .entities
            .map { entityConverter.toEntity(it) }
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
            .map { entityConverter.toReferenceValue(it) }
    }

    fun list(name: String, request: EntityListRequest): EntityListPage {
        val entity = entities.first { it.name == name }

        val query = queryBuilderService.selectQuery(entity, request.filter, request.sort)

        val selectQuery = entityManager.createQuery(query.query, entity.type.javaType)
        val countQuery = entityManager.createQuery(query.countQuery, Long::class.java)
        for (parameter in query.parameters) {
            selectQuery.setParameter(parameter.key, parameter.value)
            countQuery.setParameter(parameter.key, parameter.value)
        }

        val count = countQuery.singleResult

        val result = selectQuery
            .setFirstResult(request.page * request.size)
            .setMaxResults(request.size)
            .resultList
            .map { entityConverter.toRecord(entity, it) }

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
            .let { entityConverter.toRecord(entity, it) }
    }

    @Transactional
    fun update(name: String, value: String) {
        val entity = entities.first { it.name == name }

        val valueNode = mapper.readTree(value)
        val entityValue = entity.type.javaType.getDeclaredConstructor().newInstance()

        for (field in entity.fields) {

            if (!valueNode.has(field.name)) {
                continue
            }

            val fieldValueNode = valueNode.get(field.name)
            val declaredField = entity.type.javaType.getDeclaredField(field.name)
            declaredField.trySetAccessible()

            if (fieldValueNode.isNull) {
                declaredField.set(entityValue, null)
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

        val isNew = entity.type.javaType.getDeclaredField("id").get(entityValue) == null
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

}