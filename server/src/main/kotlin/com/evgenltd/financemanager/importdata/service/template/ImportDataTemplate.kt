package com.evgenltd.financemanager.importdata.service.template

import com.evgenltd.financemanager.importdata.entity.DocumentEntry
import java.nio.file.Path

interface ImportDataTemplate {

    fun convert(account: String, path: Path): List<DocumentEntry>

    @Target(AnnotationTarget.CLASS)
    annotation class Info(
            val value: String
    )

}