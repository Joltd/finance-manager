package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.account.entity.Account
import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.util.*

@Entity
@Table(name = "import_data")
class ImportData(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var parser: UUID = UUID.randomUUID(),

    @ManyToOne
    @JoinColumn(name = "account_id")
    var account: Account,

    var currency: String? = null,

    @Enumerated(EnumType.STRING)
    var status: ImportDataStatus = ImportDataStatus.NEW,

    var message: String? = null,

    var progress: Boolean = false,

    @OneToMany(mappedBy = "importData", cascade = [CascadeType.REMOVE], orphanRemoval = true)
    var entries: MutableList<ImportDataEntry> = mutableListOf(),

    @OneToMany(mappedBy = "importData", cascade = [CascadeType.REMOVE], orphanRemoval = true)
    var totals: MutableList<ImportDataTotal> = mutableListOf(),

    @JdbcTypeCode(SqlTypes.JSON)
    var hiddenOperations: MutableSet<UUID> = mutableSetOf()

) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ImportData

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }
}

enum class ImportDataStatus {
    NEW, PREPARE_IN_PROGRESS, PREPARE_DONE, IMPORT_IN_PROGRESS, IMPORT_DONE, FAILED
}
