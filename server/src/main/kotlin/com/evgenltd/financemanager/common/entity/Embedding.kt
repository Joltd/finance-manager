package com.evgenltd.financemanager.common.entity

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.util.*

@Entity
@Table(name = "embeddings")
class Embedding(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @JdbcTypeCode(SqlTypes.VECTOR)
    var vector: FloatArray? = null,
)