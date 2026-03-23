package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.importexport.record.ImportDataParsedFailedEntry
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.TenantId
import org.hibernate.type.SqlTypes
import java.util.*

@Entity
@Table(name = "import_data")
class ImportData(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @TenantId
    var tenant: UUID? = null,

    @ManyToOne
    @JoinColumn(name = "account_id")
    var account: Account,

    var currency: String? = null,

    @Enumerated(EnumType.STRING)
    var parsingStatus: ImportDataParsingStatus = ImportDataParsingStatus.CREATED,

    /**
     * Valid by all grand totals validity and "operation + suggested = actual" condition
     */
    var valid: Boolean = false,

    @OneToMany(mappedBy = "importData", cascade = [CascadeType.REMOVE, CascadeType.MERGE, CascadeType.PERSIST], orphanRemoval = true)
    var totals: MutableList<ImportDataTotal> = mutableListOf(),

    @OneToMany(mappedBy = "importData", cascade = [CascadeType.REMOVE], orphanRemoval = true)
    var days: MutableList<ImportDataDay> = mutableListOf(),

    @JdbcTypeCode(SqlTypes.JSON)
    var hiddenOperations: MutableSet<UUID> = mutableSetOf(),

    @JdbcTypeCode(SqlTypes.JSON)
    var failedEntries: MutableList<ImportDataParsedFailedEntry> = mutableListOf(),

) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ImportData

        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String = "ImportData(id=$id, account=$account)"

}
