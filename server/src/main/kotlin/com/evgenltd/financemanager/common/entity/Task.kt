package com.evgenltd.financemanager.common.entity

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.*


@Entity
@Table(name = "tasks")
class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null

    lateinit var bean: String

    lateinit var method: String

    lateinit var key: String

    var version: Long = 0

    var progress: Boolean = false

    @JdbcTypeCode(SqlTypes.JSON)
    lateinit var payload: ObjectNode

    var startedAt: Instant? = null
}