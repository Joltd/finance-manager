package com.evgenltd.financemanager.candy.entity

import com.evgenltd.financemanager.common.util.Amount
import jakarta.persistence.*
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "candies")
class Candy(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID?,

    var date: LocalDate,

    @Enumerated(EnumType.STRING)
    var direction: Direction,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_currency")),
    )
    var amount: Amount,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_usd_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_usd_currency")),
    )
    var amountUsd: Amount,

    var comment: String?,

)

enum class Direction { IN, OUT }