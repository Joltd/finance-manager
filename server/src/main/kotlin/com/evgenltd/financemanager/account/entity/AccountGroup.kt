package com.evgenltd.financemanager.account.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import jakarta.persistence.criteria.Path
import jakarta.persistence.criteria.Root
import java.util.*

@Entity
@Table(name = "account_groups")
class AccountGroup(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var name: String,

    var deleted: Boolean = false,

    @OneToMany(mappedBy = "group")
    var accounts: MutableList<Account> = mutableListOf(),

) {

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as AccountGroup

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }

    companion object {
        fun name(root: Root<AccountGroup>): Path<String> = root.get(AccountGroup::name.name)
    }
}
