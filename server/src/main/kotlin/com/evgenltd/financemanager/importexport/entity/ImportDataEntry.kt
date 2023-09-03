package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.record.SuggestedOperationRecord
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationRecord
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "import_data_entries")
class ImportDataEntry(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @ManyToOne
    @JoinColumn(name = "import_data_id")
    var importData: ImportData,

    @JdbcTypeCode(SqlTypes.JSON)
    var parsedEntry: ImportDataParsedEntry,

    @JdbcTypeCode(SqlTypes.JSON)
    var suggestedOperation: SuggestedOperationRecord? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    var existedOperations: List<UUID> = emptyList(),

    @JdbcTypeCode(SqlTypes.JSON)
    var matchedCategoryMappings: List<CategoryMapping> = emptyList(),

    var preparationResult: Boolean = false,

    var preparationError: String? = null,

    var option: ImportOption = ImportOption.NONE,

    var importResult: ImportResult = ImportResult.NOT_IMPORTED,

    var importError: String? = null,

    )

enum class ImportOption {
    NONE,
    CREATE_NEW,
    SKIP,
    REPLACE
}

enum class ImportResult {
    NOT_IMPORTED,
    DONE,
    FAILED
}