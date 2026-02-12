package com.evgenltd.financemanager.importexport.entity

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
import java.util.UUID

@Entity
@Table(name = "import_data_day")
class ImportDataDay(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @ManyToOne
    @JoinColumn(name = "import_data_id")
    var importData: ImportData,

    var date: LocalDate,

    var valid: Boolean = false,

    @OneToMany(mappedBy = "importDataDay", cascade = [CascadeType.REMOVE, CascadeType.MERGE, CascadeType.PERSIST], orphanRemoval = true)
    var totals: MutableList<ImportDataTotal> = mutableListOf(),

    @OneToMany(mappedBy = "importDataDay", cascade = [CascadeType.REMOVE], orphanRemoval = true)
    var entries: MutableList<ImportDataEntry> = mutableListOf(),

) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ImportDataDay

        return id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0

    override fun toString(): String = "ImportDataDay(id=$id, importData=$importData, date=$date, valid=$valid)"

}