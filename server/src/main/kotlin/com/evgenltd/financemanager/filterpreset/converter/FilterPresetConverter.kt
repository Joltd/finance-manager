package com.evgenltd.financemanager.filterpreset.converter

import com.evgenltd.financemanager.filterpreset.entity.FilterPreset
import com.evgenltd.financemanager.filterpreset.record.FilterPresetRecord
import org.springframework.stereotype.Service

@Service
class FilterPresetConverter {

    fun toRecord(entity: FilterPreset): FilterPresetRecord = FilterPresetRecord(
        id = entity.id,
        presetKey = entity.presetKey,
        name = entity.name,
        filter = entity.filter,
    )

    fun fillEntity(entity: FilterPreset?, record: FilterPresetRecord): FilterPreset = entity?.also {
        it.presetKey = record.presetKey
        it.name = record.name
        it.filter = record.filter
    } ?: FilterPreset(
        presetKey = record.presetKey,
        name = record.name,
        filter = record.filter,
    )

}
