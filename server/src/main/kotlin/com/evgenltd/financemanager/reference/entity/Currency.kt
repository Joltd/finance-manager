package com.evgenltd.financemanager.reference.entity

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "currencies")
class Currency(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var name: String,

    var crypto: Boolean,

)