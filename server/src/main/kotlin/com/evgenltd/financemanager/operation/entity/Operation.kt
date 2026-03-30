package com.evgenltd.financemanager.operation.entity

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.ai.entity.Embedding
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.tag.entity.Tag
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.TenantId
import org.hibernate.type.SqlTypes
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "operations")
class Operation(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @TenantId
    var tenant: UUID? = null,

    override var date: LocalDate,

    @Enumerated(EnumType.STRING)
    override var type: OperationType,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_from_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_from_currency")),
    )
    override var amountFrom: Amount,

    @ManyToOne
    @JoinColumn(name = "account_from_id")
    override var accountFrom: Account,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_to_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_to_currency")),
    )
    override var amountTo: Amount,

    @ManyToOne
    @JoinColumn(name = "account_to_id")
    override var accountTo: Account,

    var description: String?,

    @JdbcTypeCode(SqlTypes.JSON)
    var raw: List<String> = emptyList(),

    @ManyToOne
    @JoinColumn(name = "hint_id")
    var hint: Embedding? = null,

    @OneToMany(mappedBy = "operation", cascade = [CascadeType.REMOVE], orphanRemoval = true)
    var transactions: MutableList<Transaction> = mutableListOf(),

    @ManyToMany
    @JoinTable(
        name = "operation_tags",
        joinColumns = [JoinColumn(name = "operation_id")],
        inverseJoinColumns = [JoinColumn(name = "tag_id")],
    )
    var tags: MutableList<Tag> = mutableListOf(),
) : Operational {

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Operation

        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String =
        "Operation(id=$id, date=$date, type=$type, amountFrom=$amountFrom, accountFrom=$accountFrom, amountTo=$amountTo, accountTo=$accountTo)"

}
