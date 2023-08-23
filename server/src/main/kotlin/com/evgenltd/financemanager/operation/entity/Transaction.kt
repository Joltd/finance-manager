package com.evgenltd.financemanager.operation.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.entity.Account
import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "transactions")
class Transaction(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: String? = null,

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
)

enum class TransactionType { IN, OUT }