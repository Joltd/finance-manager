package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.operation.entity.Operation
import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
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

    @ManyToOne
    @JoinColumn(name = "operation_id")
    var operation: Operation? = null,

    @OneToMany(mappedBy = "importDataEntry", cascade = [CascadeType.REMOVE], orphanRemoval = true)
    var operations: MutableList<ImportDataOperation> = mutableListOf(),

    var date: LocalDate = LocalDate.now(),

    var visible: Boolean = false
) {

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ImportDataEntry

        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String = "ImportDataEntry(id=$id, date=$date, visible=$visible)"

}
