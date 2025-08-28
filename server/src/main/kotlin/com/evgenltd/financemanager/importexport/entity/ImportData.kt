package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.account.entity.Account
import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
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

    @ManyToOne
    @JoinColumn(name = "account_id")
    var account: Account,

    @Deprecated("Should be removed")
    var currency: String? = null,

    var progress: Boolean = false,

    var valid: Boolean = false,

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

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String = "ImportData(id=$id, account=$account)"

}
