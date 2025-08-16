package com.evgenltd.financemanager.operation.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.account.entity.Account
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "transactions")
class Transaction(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @Enumerated(EnumType.STRING)
    var type: TransactionType,

    var date: LocalDate,

    @Embedded
    var amount: Amount,

    @ManyToOne
    @JoinColumn(name = "account_id")
    var account: Account,

    @ManyToOne
    @JoinColumn(name = "operation_id")
    var operation: Operation,

) {

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Transaction

        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String = "Transaction(id=$id, type=$type, date=$date, amount=$amount, account=$account)"

}
