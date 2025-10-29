package com.evgenltd.financemanager.account.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.hibernate.annotations.TenantId
import java.util.*

@Entity
@Table(name = "account_groups")
class AccountGroup(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @TenantId
    var tenant: UUID? = null,

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

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String = "AccountGroup(id=$id, name='$name')"

}
