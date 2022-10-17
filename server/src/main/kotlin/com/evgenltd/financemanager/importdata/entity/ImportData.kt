package com.evgenltd.financemanager.importdata.entity

class ImportData(
        var id: String?,
        var account: String?,
        var template: String?,
        var file: String?,
        var entries: List<ImportDataEntry>
)