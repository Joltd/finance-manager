package com.evgenltd.financemanager.reference.entity

import jakarta.persistence.*
import jakarta.persistence.criteria.Path
import jakarta.persistence.criteria.Root
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

) {
    companion object {
        fun name(root: Root<Account>): Path<String> = root.get(Account::name.name)

        fun type(root: Root<Account>): Path<AccountType> = root.get(Account::type.name)
    }
}

enum class AccountType {
    ACCOUNT,
    EXPENSE,
    INCOME,
}