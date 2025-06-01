package com.evgenltd.financemanager.reference.entity

import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.criteria.Path
import jakarta.persistence.criteria.Root
import java.time.LocalDate
import java.util.*

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

    var reviseDate: LocalDate? = null,

    var parser: String? = null,

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