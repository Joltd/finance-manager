package com.evgenltd.financemanager.turnover.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.entity.Account
import jakarta.persistence.*
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "turnovers")
class Turnover(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var date: LocalDate,

    @ManyToOne
    @JoinColumn(name = "account_id")
    var account: Account,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_currency")),
    )
    var amount: Amount,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "cumulative_amount_value")),
        AttributeOverride(name = "currency", column = Column(name = "cumulative_amount_currency")),
    )
    var cumulativeAmount: Amount,

)