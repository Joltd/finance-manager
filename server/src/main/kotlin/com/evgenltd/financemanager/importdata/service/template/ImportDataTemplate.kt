package com.evgenltd.financemanager.importdata.service.template

import com.evgenltd.financemanager.importdata.entity.ImportDataEntry
import java.nio.file.Path

interface ImportDataTemplate {

    fun convert(path: Path): List<ImportDataEntry>

    @Target(AnnotationTarget.CLASS)
    annotation class Info(
            val value: String
    )

}