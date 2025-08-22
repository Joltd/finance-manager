package com.evgenltd.financemanager.exchangerate.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.UpdateTimestamp
import java.math.BigDecimal
import java.time.Instant
import java.util.*

@Entity
@Table(name = "exchange_rate")
class ExchangeRate(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID?,

    var currency: String,

    var value: BigDecimal,

    @UpdateTimestamp
    var updatedAt: Instant? = null,

) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ExchangeRate

        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String = "ExchangeRate(id=$id, currency='$currency', value=$value, updatedAt=$updatedAt)"

}
