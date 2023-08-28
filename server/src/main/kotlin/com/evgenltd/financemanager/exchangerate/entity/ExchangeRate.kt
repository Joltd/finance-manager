package com.evgenltd.financemanager.exchangerate.entity

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

    var from: String,

    var to: String,

    var value: BigDecimal

)