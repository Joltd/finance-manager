package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.reference.entity.Account
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.util.*

@Entity
@Table(name = "import_data")
class ImportData(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var parser: UUID,

    @ManyToOne
    @JoinColumn(name = "account_id")
    var account: Account,

    var currency: String? = null,

    @Enumerated(EnumType.STRING)
    var status: ImportDataStatus,

    var message: String? = null,

    var progress: Double

)

enum class ImportDataStatus {
    NEW, PREPARE_IN_PROGRESS, PREPARE_DONE, IMPORT_IN_PROGRESS, IMPORT_DONE, FAILED
}