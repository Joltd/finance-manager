package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.operation.entity.Operation
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "operation_revise_entries")
class OperationReviseEntry(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @ManyToOne
    @JoinColumn(name = "operation_revise_id")
    var operationRevise: OperationRevise,

    var date: LocalDate,

    @ManyToOne
    @JoinColumn(name = "operation_id")
    var operation: Operation? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    var parsedEntry: ImportDataParsedEntry? = null,

)