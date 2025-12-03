package com.evgenltd.financemanager.operation.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationGroupRecord
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.service.OperationProcessService
import com.evgenltd.financemanager.operation.service.OperationService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@DataResponse
@SkipLogging
class OperationController(
    private val operationService: OperationService,
    private val operationProcessService: OperationProcessService,
) {

    @GetMapping("/api/v1/operation")
    @PreAuthorize("hasRole('USER')")
    fun list(filter: OperationFilter): List<OperationGroupRecord> = operationService.list(filter)

    @GetMapping("/api/v1/operation/{id}")
    @PreAuthorize("hasRole('USER')")
    fun byId(@PathVariable("id") id: UUID): OperationRecord = operationService.byId(id)

    @PostMapping("/api/v1/operation")
    @PreAuthorize("hasRole('USER')")
    fun update(@RequestBody record: OperationRecord) {
        operationProcessService.update(record)
    }

    @DeleteMapping("/api/v1/operation/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(@PathVariable("id") id: UUID) = operationProcessService.delete(id)

    @DeleteMapping("/api/v1/operation")
    @PreAuthorize("hasRole('USER')")
    fun delete(@RequestBody ids: List<UUID>) = operationProcessService.delete(ids)

}