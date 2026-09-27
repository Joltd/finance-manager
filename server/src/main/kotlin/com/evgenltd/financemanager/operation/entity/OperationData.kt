package com.evgenltd.financemanager.operation.entity

import com.evgenltd.financemanager.ai.entity.Embedding
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "operation_data")
class OperationData(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var transactionId: String? = null,

    var mcc: String? = null,

    var bankType: String? = null,

    var bankCategory: String? = null,

    var merchant: String? = null,

    var counterparty: String? = null,

    var purpose: String? = null,

    @Column(nullable = false)
    var raw: String,

    @OneToOne
    @JoinColumn(name = "hint_id", unique = true)
    var hint: Embedding? = null,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as OperationData
        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0
}
