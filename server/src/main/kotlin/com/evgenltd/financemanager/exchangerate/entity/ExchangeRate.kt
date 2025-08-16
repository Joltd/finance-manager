package com.evgenltd.financemanager.exchangerate.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "exchange_rates")
class ExchangeRate(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID?,

    var date: LocalDate,

    @Column(name = "\"from\"")
    var from: String,

    @Column(name = "\"to\"")
    var to: String,

    var value: BigDecimal

) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ExchangeRate

        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String = "ExchangeRate(id=$id, date=$date, from='$from', to='$to', value=$value)"

}
