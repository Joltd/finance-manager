package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.account.entity.Account
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "import_data_suggestions")
class ImportDataSuggestion(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @ManyToOne
    @JoinColumn(name = "import_data_entry_id", nullable = false)
    var importDataEntry: ImportDataEntry,

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    var account: Account,

    var description: String? = null,

    var score: Double,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ImportDataSuggestion
        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0
}
