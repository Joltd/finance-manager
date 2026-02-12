package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
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
import java.util.*

@Entity
@Table(name = "import_data_total")
class ImportDataTotal(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @ManyToOne
    @JoinColumn(name = "import_data_id")
    var importData: ImportData? = null,

    @ManyToOne
    @JoinColumn(name = "import_data_day_id")
    var importDataDay: ImportDataDay? = null,

    var valid: Boolean = false,

    var currency: String,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "parsed_value")),
        AttributeOverride(name = "currency", column = Column(name = "parsed_currency")),
    )
    var parsed: Amount,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "operation_value")),
        AttributeOverride(name = "currency", column = Column(name = "operation_currency")),
    )
    var operation: Amount,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "suggested_value")),
        AttributeOverride(name = "currency", column = Column(name = "suggested_currency")),
    )
    var suggested: Amount,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "actual_value")),
        AttributeOverride(name = "currency", column = Column(name = "actual_currency")),
    )
    var actual: Amount,

) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ImportDataTotal

        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String = "ImportDataTotal(id=$id, importData=$importData, importDataDay=$importDataDay, valid=$valid, currency='$currency', parsed=$parsed, operation=$operation, suggested=$suggested, actual=$actual)"

}

fun emptyTotal(currency: String): ImportDataTotal = ImportDataTotal(
    currency = currency,
    parsed = emptyAmount(currency),
    operation = emptyAmount(currency),
    suggested = emptyAmount(currency),
    actual = emptyAmount(currency),
)