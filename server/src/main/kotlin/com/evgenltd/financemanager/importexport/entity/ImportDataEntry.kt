package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationData
import com.evgenltd.financemanager.operation.entity.OperationType
import jakarta.persistence.AttributeOverride
import jakarta.persistence.AttributeOverrides
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.OneToOne
import jakarta.persistence.OrderBy
import jakarta.persistence.Table
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "import_data_entries")
class ImportDataEntry(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @ManyToOne
    @JoinColumn(name = "import_data_day_id", nullable = false)
    var importDataDay: ImportDataDay,

    @ManyToOne
    @JoinColumn(name = "operation_id")
    var operation: Operation? = null,

    @OneToOne
    @JoinColumn(name = "operation_data_id", nullable = false, unique = true)
    var operationData: OperationData,

    var date: LocalDate? = null,

    @Enumerated(EnumType.STRING)
    var type: OperationType? = null,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_from_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_from_currency")),
    )
    var amountFrom: Amount? = null,

    @ManyToOne
    @JoinColumn(name = "account_from_id")
    var accountFrom: Account? = null,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_to_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_to_currency")),
    )
    var amountTo: Amount? = null,

    @ManyToOne
    @JoinColumn(name = "account_to_id")
    var accountTo: Account? = null,

    var description: String? = null,

    @OneToMany(mappedBy = "importDataEntry", cascade = [CascadeType.REMOVE], orphanRemoval = true)
    @OrderBy("score DESC, id ASC")
    var suggestions: MutableList<ImportDataSuggestion> = mutableListOf(),
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ImportDataEntry
        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String = "ImportDataEntry(id=$id, date=$date, type=$type)"
}
