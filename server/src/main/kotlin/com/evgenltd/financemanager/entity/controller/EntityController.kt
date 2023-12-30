package com.evgenltd.financemanager.entity.controller

import com.evgenltd.financemanager.entity.record.EntityFilter
import com.evgenltd.financemanager.entity.record.EntityPage
import com.evgenltd.financemanager.entity.record.EntityRecord
import com.evgenltd.financemanager.entity.service.EntityService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class EntityController(
    private val entityService: EntityService
) {

    @GetMapping("/entity")
    fun entityList(): List<EntityRecord> = entityService.entityList()

    @PostMapping("/entity/{name}")
    fun list(
        @PathVariable name: String,
        @RequestBody filter: EntityFilter
    ): EntityPage = entityService.list(name, filter)

}