package com.evgenltd.financemanager.entity.controller

import com.evgenltd.financemanager.entity.record.EntityListRequest
import com.evgenltd.financemanager.entity.record.EntityListPage
import com.evgenltd.financemanager.entity.record.EntityRecord
import com.evgenltd.financemanager.entity.service.EntityService
import com.evgenltd.financemanager.reference.record.Reference
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
class EntityController(
    private val entityService: EntityService
) {

    @GetMapping("/entity")
    fun entityList(): List<EntityRecord> = entityService.entityList()

    @GetMapping("/entity/{name}/reference")
    fun references(
        @PathVariable name: String,
        @RequestParam("mask", required = false) mask: String?,
        @RequestParam("id", required = false) id: UUID?
    ): List<Reference> = entityService.referenceList(name, mask, id)

    @PostMapping("/entity/{name}/list")
    fun list(
        @PathVariable name: String,
        @RequestBody filter: EntityListRequest
    ): EntityListPage = entityService.list(name, filter)

    @GetMapping("/entity/{name}/{id}")
    fun byId(
        @PathVariable name: String,
        @PathVariable id: UUID
    ): Map<String,Any?> = entityService.byId(name, id)

    @PostMapping("/entity/{name}")
    fun update(@PathVariable name: String, @RequestBody value: String) {
        entityService.update(name, value)
    }

    @DeleteMapping("/entity/{name}/{id}")
    fun delete(
        @PathVariable name: String,
        @PathVariable id: UUID
    ) {
        entityService.delete(name, id)
    }

}