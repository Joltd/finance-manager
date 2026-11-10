package com.evgenltd.financemanager.pricing.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "pricing_surveys")
class PricingSurvey(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID?,

    var country: String,

    var city: String,

    var currency: String,

    var createdAt: LocalDateTime,

) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as PricingSurvey

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }
}
