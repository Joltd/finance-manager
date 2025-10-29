package com.evgenltd.financemanager.account.entity

import com.evgenltd.financemanager.common.util.Amount
import jakarta.persistence.AttributeOverride
import jakarta.persistence.AttributeOverrides
import jakarta.persistence.Column
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.TenantId
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "balances")
class Balance(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @TenantId
    var tenant: UUID? = null,

    @ManyToOne
    @JoinColumn(name = "account_id")
    var account: Account,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_currency")),
    )
    var amount: Amount,

    var date: LocalDate,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Balance

        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String = "Balance(id=$id, account=$account, amount=$amount, date=$date)"

}