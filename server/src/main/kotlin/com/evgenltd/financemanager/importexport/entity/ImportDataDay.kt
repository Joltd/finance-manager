package com.evgenltd.financemanager.importexport.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.util.*

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

    /**
     * Valid by all totals validity
     */
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