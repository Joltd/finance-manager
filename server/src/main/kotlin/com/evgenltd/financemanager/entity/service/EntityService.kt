package com.evgenltd.financemanager.entity.service

import com.evgenltd.financemanager.entity.converter.EntityConverter
import com.evgenltd.financemanager.entity.record.*
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.Reference
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.treeToValue
import jakarta.annotation.PostConstruct
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class EntityService(
    private val entityManager: EntityManager,
    private val entityConverter: EntityConverter,
    private val mapper: ObjectMapper,
    private val conditionBuilderService: ConditionBuilderService,
) {

    private lateinit var entities: List<EntityRecord>

    @PostConstruct
    fun postConstruct() {
        entities = entityManager.metamodel
            .entities
            .map { entityConverter.toEntity(it) }
            .toList()
    }

    fun fields(javaType: Class<*>): List<EntityFieldRecord> = entities.first { it.type.javaType == javaType }.fields

    fun entityList(): List<EntityRecord> = entities
        .map {  entity ->
            entity.copy(
                fields = entity.fields.filter { it.type != EntityFieldType.AMOUNT }
            )
        }
        .sortedBy { it.name }

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

        val cb = entityManager.criteriaBuilder

        //
        val countQuery = cb.createQuery(Long::class.java)
        val countRoot = countQuery.from(entity.type)
        request.filter
            ?.let { conditionBuilderService.build(request.filter, entity.fields, countRoot, cb) }
            ?.let { countQuery.where(it) }
        countQuery.select(cb.count(countRoot))

        val count = entityManager.createQuery(countQuery)
            .singleResult

        //

        val query = cb.createQuery()
        val root = query.from(entity.type)
        request.filter
            ?.let { conditionBuilderService.build(request.filter, entity.fields, root, cb) }
            ?.let { query.where(it) }
        query.orderBy(request.sort.map {
            when (it.direction) {
                SortDirection.ASC -> cb.asc(root.get<Any>(it.field))
                SortDirection.DESC -> cb.desc(root.get<Any>(it.field))
            }
        })

        val result = entityManager.createQuery(query)
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
                val referenceValue = entityManager.find(field.attributes.last().javaType, reference.id)
                declaredField.set(entityValue, referenceValue)
                continue
            }

            declaredField.set(entityValue, mapper.treeToValue(fieldValueNode, field.attributes.last().javaType))
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