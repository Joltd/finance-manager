package com.evgenltd.financemanager.taxes.entity

import com.evgenltd.financemanager.common.util.Amount
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "taxes")
class Tax(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var date: LocalDate,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "base_value")),
        AttributeOverride(name = "currency", column = Column(name = "base_currency")),
    )
    var base: Amount,

    var rate: BigDecimal,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_currency")),
    )
    var amount: Amount

)