package com.evgenltd.financemanager.reference.entity

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "accounts")
class Account(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var name: String,

    @Enumerated(EnumType.STRING)
    var type: AccountType,

    var deleted: Boolean = false,

)

enum class AccountType {
    ACCOUNT,
    EXPENSE,
    INCOME,
}