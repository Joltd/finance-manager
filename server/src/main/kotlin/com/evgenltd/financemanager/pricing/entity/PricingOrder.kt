package com.evgenltd.financemanager.pricing.entity

import com.evgenltd.financemanager.common.util.Amount
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "pricing_orders")
class PricingOrder(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID?,

    var date: LocalDate,

    @ManyToOne
    @JoinColumn(name = "item_id")
    var item: PricingItem,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "price_value")),
        AttributeOverride(name = "currency", column = Column(name = "price_currency")),
    )
    var price: Amount,

    var quantity: BigDecimal,

    var rate: BigDecimal?,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "price_usd_value")),
        AttributeOverride(name = "currency", column = Column(name = "price_usd_currency")),
    )
    var priceUsd: Amount,

    var country: String,

    var store: String,

    var comment: String?,

    var createdAt: LocalDateTime,

)