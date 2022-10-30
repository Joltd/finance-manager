package com.evgenltd.financemanager.importexport.service.template

import com.evgenltd.financemanager.importexport.entity.DocumentEntry
import java.nio.file.Path

interface ImportDataTemplate {

    fun convert(account: String, path: Path): List<DocumentEntry>

    @Target(AnnotationTarget.CLASS)
    annotation class Info(
            val value: String
    )

}