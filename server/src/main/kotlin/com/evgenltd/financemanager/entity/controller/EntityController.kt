package com.evgenltd.financemanager.entity.controller

import com.evgenltd.financemanager.entity.record.EntityListRequest
import com.evgenltd.financemanager.entity.record.EntityListPage
import com.evgenltd.financemanager.entity.record.EntityRecord
import com.evgenltd.financemanager.entity.service.EntityService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
class EntityController(
    private val entityService: EntityService
) {

    @GetMapping("/entity")
    fun entityList(): List<EntityRecord> = entityService.entityList()

    @PostMapping("/entity/{name}")
    fun list(
        @PathVariable name: String,
        @RequestBody filter: EntityListRequest
    ): EntityListPage = entityService.list(name, filter)

    @DeleteMapping("/entity/{name}/{id}")
    fun delete(
        @PathVariable name: String,
        @PathVariable id: UUID
    ) {
        entityService.delete(name, id)
    }

}