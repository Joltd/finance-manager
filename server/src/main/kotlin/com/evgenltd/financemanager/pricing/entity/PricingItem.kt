package com.evgenltd.financemanager.pricing.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.util.*

@Entity
@Table(name = "pricing_items")
class PricingItem(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID?,

    var name: String,

    var category: String,

    var unit: String,

    var defaultQuantity: BigDecimal,

    )