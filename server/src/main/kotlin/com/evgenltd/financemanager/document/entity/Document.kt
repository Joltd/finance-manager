package com.evgenltd.financemanager.document.entity

import org.springframework.data.annotation.Id
import java.time.LocalDate
import org.springframework.data.mongodb.core.mapping.Document as Entity

@Entity("document")
abstract class Document(
        @Id
        var id: String?,
        var date: LocalDate,
        var description: String
)