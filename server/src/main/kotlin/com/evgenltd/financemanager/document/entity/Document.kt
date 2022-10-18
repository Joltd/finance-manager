package com.evgenltd.financemanager.document.entity

import org.springframework.data.annotation.Id
import java.time.LocalDate

abstract class Document(
        @Id
        var id: String?,
        var date: LocalDate,
        var description: String
)

