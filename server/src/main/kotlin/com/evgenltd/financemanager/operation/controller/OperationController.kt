package com.evgenltd.financemanager.operation.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationGroupRecord
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.service.OperationService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@DataResponse
class OperationController(
    private val operationService: OperationService
) {

    @GetMapping("/operation")
    fun list(filter: OperationFilter): List<OperationGroupRecord> = operationService.list(filter)

    @GetMapping("/operation/{id}")
    fun byId(@PathVariable("id") id: UUID): OperationRecord = operationService.byId(id)

    @PostMapping("/operation")
    fun update(@RequestBody record: OperationRecord) = operationService.update(record)

    @DeleteMapping("/operation/{id}")
    fun delete(@PathVariable("id") id: UUID) = operationService.delete(id)

    @DeleteMapping("/operation")
    fun delete(@RequestBody ids: List<UUID>) = ids.forEach { delete(it) }

}