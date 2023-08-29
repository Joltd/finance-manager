package com.evgenltd.financemanager.operation.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.entity.Account
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
import java.util.UUID

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
    var operation: Operation
) {

    fun signedAmount(): Amount = if (type == TransactionType.OUT) -amount else amount

}

enum class TransactionType { IN, OUT }