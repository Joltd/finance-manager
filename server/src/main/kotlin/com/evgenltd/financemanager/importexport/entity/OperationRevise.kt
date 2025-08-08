package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.account.entity.Account
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "operation_revises")
class OperationRevise(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var dateFrom: LocalDate? = null,

    var dateTo: LocalDate? = null,

    var currency: String? = null,

    @ManyToOne
    @JoinColumn(name = "account_id")
    var account: Account,

    var parser: UUID,

    @JdbcTypeCode(SqlTypes.JSON)
    var dates: List<OperationReviseDate>
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as OperationRevise

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }
}

data class OperationReviseDate(
    val date: LocalDate,
    val revised: Boolean,
    val hidden: Boolean,
)
