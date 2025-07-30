package com.evgenltd.financemanager.reference.entity

import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
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

    @ManyToOne
    @JoinColumn(name = "group_id")
    var group: AccountGroup? = null,

) {

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Account

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }

    override fun toString(): String = "Account(id=$id, name='$name')"


    companion object {
        fun name(root: Root<Account>): Path<String> = root.get(Account::name.name)

        fun type(root: Root<Account>): Path<AccountType> = root.get(Account::type.name)
    }
}
