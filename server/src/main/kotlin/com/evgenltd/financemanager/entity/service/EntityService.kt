package com.evgenltd.financemanager.entity.service

import com.evgenltd.financemanager.entity.record.*
import jakarta.annotation.PostConstruct
import jakarta.persistence.EntityManager
import jakarta.persistence.metamodel.Attribute
import jakarta.persistence.metamodel.EntityType
import org.springframework.stereotype.Service
import java.lang.reflect.Field

@Service
class EntityService(
    private val entityManager: EntityManager
) {

    @PostConstruct
    fun postConstruct() {
        println()
    }

    fun entityList(): List<EntityRecord> {
        return entityManager.metamodel
            .entities
            .map {
                EntityRecord(
                    it.name,
                    it.name,
                    it.attributes.map { EntityFieldRecord(it.name) }
                )
            }
            .toList()
    }

    fun list(name: String, filter: EntityFilter): EntityPage {
        val type = entityManager.metamodel.entities
            .first { it.name == name }

        val cb = entityManager.criteriaBuilder
        val query = cb.createQuery()
        val root = query.from(type)

        filter.sort
            .map {
                when (it.direction) {
                    SortDirection.ASC -> cb.asc(root.get<Any>(it.field))
                    SortDirection.DESC -> cb.desc(root.get<Any>(it.field))
                }
            }
            .takeIf { it.isNotEmpty() }
            ?.let { query.orderBy(it) }

        val result = entityManager.createQuery(query)
            .setFirstResult(filter.page * filter.size)
            .setMaxResults(filter.size)
            .resultList
            .map { toRecord(type, it) }

        return EntityPage(
            total = 0L,
            page = filter.page,
            size = filter.size,
            values = result
        )
    }

    fun byId() {

    }

    fun update() {

    }

    fun delete() {

    }

    private fun toRecord(type: EntityType<*>, entity: Any): Map<String,Any> {
        return type.attributes
            .filter { it.persistentAttributeType == Attribute.PersistentAttributeType.BASIC }
            .map {
                val field = it.javaMember as Field
                it.name to field.get(entity)
            }
            .associate { it }
    }

}