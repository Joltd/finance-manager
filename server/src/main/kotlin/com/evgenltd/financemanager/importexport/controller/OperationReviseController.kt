package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.importexport.entity.OperationReviseDate
import com.evgenltd.financemanager.importexport.record.OperationReviseEntryFilter
import com.evgenltd.financemanager.importexport.record.OperationReviseEntryRecord
import com.evgenltd.financemanager.importexport.record.OperationReviseRecord
import com.evgenltd.financemanager.importexport.service.OperationReviseService
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate
import java.util.UUID

@RestController
class OperationReviseController(
    private val operationReviseService: OperationReviseService,
    private val mapper: ObjectMapper
) {

    @GetMapping("/operation-revise")
    fun list(): List<OperationReviseRecord> = operationReviseService.list()

    @PatchMapping("/operation-revise/{id}/date")
    fun updateDate(
        @PathVariable("id") id: UUID,
        @RequestBody request: OperationReviseDate
    ) = operationReviseService.updateDate(id, request)

    @PostMapping("/operation-revise/{id}/entry")
    fun entryList(
        @PathVariable("id") id: UUID,
        @RequestBody filter: OperationReviseEntryFilter,
    ): List<OperationReviseEntryRecord> = operationReviseService.entryList(id, filter)

    @GetMapping("/operation-revise/{id}")
    fun byId(@PathVariable("id") id: UUID): OperationReviseRecord = operationReviseService.byId(id)

    @DeleteMapping("/operation-revise/{id}")
    fun delete(@PathVariable("id") id: UUID) = operationReviseService.delete(id)

    @PostMapping("/operation-revise")
    fun revise(
        @RequestParam("record") record: String,
        @RequestParam("file") file: MultipartFile,
    ) = operationReviseService.newRevise(
        mapper.readValue(record, OperationReviseRecord::class.java),
        file.inputStream
    )

    @PatchMapping("/operation-revise/{id}")
    fun revise(@PathVariable("id") id: UUID, ) = operationReviseService.repeatRevise(id)

}