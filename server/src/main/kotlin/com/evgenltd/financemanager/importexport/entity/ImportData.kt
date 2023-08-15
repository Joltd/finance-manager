package com.evgenltd.financemanager.importexport.entity

class ImportData(
    var id: String?,
    var parser: String,
    var account: String,
    var status: ImportDataStatus,
    var message: String?,
    var progress: Double
)

enum class ImportDataStatus {
    NEW, PREPARE_IN_PROGRESS, PREPARE_DONE, IMPORT_IN_PROGRESS, IMPORT_DONE, FAILED
}
