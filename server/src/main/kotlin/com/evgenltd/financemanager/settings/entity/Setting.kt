package com.evgenltd.financemanager.settings.entity

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "settings")
class Setting(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var name: String,

    var value: String
)