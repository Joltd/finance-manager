package com.evgenltd.financemanager.filterpreset.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.filterpreset.converter.FilterPresetConverter
import com.evgenltd.financemanager.filterpreset.entity.FilterPreset
import com.evgenltd.financemanager.filterpreset.record.FilterPresetRecord
import com.evgenltd.financemanager.filterpreset.repository.FilterPresetRepository
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
@SkipLogging
class FilterPresetService(
    private val filterPresetRepository: FilterPresetRepository,
    private val filterPresetConverter: FilterPresetConverter,
) {

    fun list(presetKey: String): List<FilterPresetRecord> =
        filterPresetRepository.findAll(FilterPreset::presetKey eq presetKey, Sort.by("name"))
            .map { filterPresetConverter.toRecord(it) }

    @Transactional
    fun create(record: FilterPresetRecord): FilterPresetRecord =
        filterPresetConverter.fillEntity(null, record)
            .let { filterPresetRepository.save(it) }
            .let { filterPresetConverter.toRecord(it) }

    @Transactional
    fun delete(id: UUID) {
        val filterPreset = filterPresetRepository.find(id)
        filterPresetRepository.delete(filterPreset)
    }

}
