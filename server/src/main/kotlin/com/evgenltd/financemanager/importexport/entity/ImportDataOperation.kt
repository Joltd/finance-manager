package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.common.entity.Embedding
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.importexport2.record.OperationScoreRecord
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "import_data_operations")
class ImportDataOperation(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @ManyToOne
    @JoinColumn(name = "import_data_entry_id")
    var importDataEntry: ImportDataEntry,

    @Enumerated(EnumType.STRING)
    var importType: ImportDataOperationType,

    var date: LocalDate,

    @Enumerated(EnumType.STRING)
    var type: OperationType,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_from_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_from_currency")),
    )
    var amountFrom: Amount,

    @ManyToOne
    @JoinColumn(name = "account_from_id")
    var accountFrom: Account? = null,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_to_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_to_currency")),
    )
    var amountTo: Amount,

    @ManyToOne
    @JoinColumn(name = "account_to_id")
    var accountTo: Account? = null,

    var description: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    var raw: List<String> = emptyList(),

    var hintInput: String? = null,

    @ManyToOne
    @JoinColumn(name = "hint_id")
    var hint: Embedding? = null,

    @ManyToOne
    @JoinColumn(name = "full_id")
    var full: Embedding? = null,

    var selected: Boolean = false,

    var distance: Double? = null, // todo rename to score

    @JdbcTypeCode(SqlTypes.JSON)
    var similarOperations: List<OperationScoreRecord> = emptyList(),
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ImportDataOperation

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }
}