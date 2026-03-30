package com.evgenltd.financemanager.tag.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.tag.record.TagRecord
import com.evgenltd.financemanager.tag.service.TagService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@DataResponse
@SkipLogging
class TagController(
    private val tagService: TagService,
) {

    @GetMapping("/api/v1/tag")
    @PreAuthorize("hasRole('USER')")
    fun list(@RequestParam("mask", required = false) mask: String?): List<TagRecord> = tagService.list(mask)

    @GetMapping("/api/v1/tag/{id}")
    @PreAuthorize("hasRole('USER')")
    fun byId(@PathVariable id: UUID): TagRecord = tagService.byId(id)

    @PostMapping("/api/v1/tag")
    @PreAuthorize("hasRole('USER')")
    fun update(@RequestBody record: TagRecord): TagRecord = tagService.update(record)

    @DeleteMapping("/api/v1/tag/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(@PathVariable id: UUID) = tagService.delete(id)

}
