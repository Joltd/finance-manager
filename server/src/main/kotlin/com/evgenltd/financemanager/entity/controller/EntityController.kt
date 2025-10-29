package com.evgenltd.financemanager.entity.controller

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.entity.record.EntityListRequest
import com.evgenltd.financemanager.entity.record.EntityListPage
import com.evgenltd.financemanager.entity.record.EntityRecord
import com.evgenltd.financemanager.entity.service.EntityService
import com.evgenltd.financemanager.common.record.Reference
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@SkipLogging
class EntityController(
    private val entityService: EntityService
) {

    @GetMapping("/api/v1/entity")
    @PreAuthorize("hasRole('USER')")
    fun entityList(): List<EntityRecord> = entityService.entityList()

    @GetMapping("/api/v1/entity/{name}/reference")
    @PreAuthorize("hasRole('USER')")
    fun references(
        @PathVariable name: String,
        @RequestParam("mask", required = false) mask: String?,
        @RequestParam("id", required = false) id: UUID?
    ): List<Reference> = entityService.referenceList(name, mask, id)

    @PostMapping("/api/v1/entity/{name}/list")
    @PreAuthorize("hasRole('USER')")
    fun list(
        @PathVariable name: String,
        @RequestBody filter: EntityListRequest
    ): EntityListPage = entityService.list(name, filter)

    @GetMapping("/api/v1/entity/{name}/{id}")
    @PreAuthorize("hasRole('USER')")
    fun byId(
        @PathVariable name: String,
        @PathVariable id: UUID
    ): Map<String,Any?> = entityService.byId(name, id)

    @PostMapping("/api/v1/entity/{name}")
    @PreAuthorize("hasRole('USER')")
    fun update(@PathVariable name: String, @RequestBody value: String) {
        entityService.update(name, value)
    }

    @DeleteMapping("/api/v1/entity/{name}/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(
        @PathVariable name: String,
        @PathVariable id: UUID
    ) {
        entityService.delete(name, id)
    }

}