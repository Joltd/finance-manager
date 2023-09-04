package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.OperationType
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.criteria.Path
import jakarta.persistence.criteria.Root
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
    var suggestedOperation: SuggestedOperation? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    var similarOperations: List<UUID> = emptyList(),

    @JdbcTypeCode(SqlTypes.JSON)
    var matchedCategoryMappings: List<CategoryMapping> = emptyList(),

    var preparationResult: Boolean = false,

    var preparationError: String? = null,

    var option: ImportOption = ImportOption.NONE,

    var importResult: ImportResult = ImportResult.NOT_IMPORTED,

    var importError: String? = null
) {
    companion object {
        fun importDataId(root: Root<ImportDataEntry>): Path<UUID> = root.get<ImportData>(ImportDataEntry::importData.name).get(ImportData::id.name)

        fun preparationResult(root: Root<ImportDataEntry>): Path<Boolean> = root.get(ImportDataEntry::preparationResult.name)

        fun option(root: Root<ImportDataEntry>): Path<ImportOption> = root.get(ImportDataEntry::option.name)

        fun importResult(root: Root<ImportDataEntry>): Path<ImportResult> = root.get(ImportDataEntry::importResult.name)
    }
}

data class ImportDataParsedEntry(
    val rawEntries: List<String>,
    val date: LocalDate,
    val type: OperationType,
    val accountFrom: UUID?,
    val amountFrom: Amount,
    val accountTo: UUID?,
    val amountTo: Amount,
    val description: String
)

data class SuggestedOperation(
    val date: LocalDate,
    val type: OperationType,
    val amountFrom: Amount,
    val accountFrom: UUID,
    val amountTo: Amount,
    val accountTo: UUID,
    val description: String,
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