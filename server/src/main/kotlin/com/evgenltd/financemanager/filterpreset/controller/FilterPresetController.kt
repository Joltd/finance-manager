package com.evgenltd.financemanager.filterpreset.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.filterpreset.record.FilterPresetRecord
import com.evgenltd.financemanager.filterpreset.service.FilterPresetService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@DataResponse
@SkipLogging
class FilterPresetController(
    private val filterPresetService: FilterPresetService,
) {

    @GetMapping("/api/v1/filter-preset")
    @PreAuthorize("hasRole('USER')")
    fun list(@RequestParam presetKey: String): List<FilterPresetRecord> = filterPresetService.list(presetKey)

    @PostMapping("/api/v1/filter-preset")
    @PreAuthorize("hasRole('USER')")
    fun create(@RequestBody record: FilterPresetRecord): FilterPresetRecord = filterPresetService.create(record)

    @DeleteMapping("/api/v1/filter-preset/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(@PathVariable id: UUID) = filterPresetService.delete(id)

}
