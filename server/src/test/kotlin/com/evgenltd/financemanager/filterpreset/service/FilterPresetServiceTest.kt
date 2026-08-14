package com.evgenltd.financemanager.filterpreset.service

import com.evgenltd.financemanager.filterpreset.converter.FilterPresetConverter
import com.evgenltd.financemanager.filterpreset.entity.FilterPreset
import com.evgenltd.financemanager.filterpreset.record.FilterPresetRecord
import com.evgenltd.financemanager.filterpreset.repository.FilterPresetRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification
import java.util.Optional
import java.util.UUID

class FilterPresetServiceTest {

    private val filterPresetRepository = mock<FilterPresetRepository>()
    private val service = FilterPresetService(filterPresetRepository, FilterPresetConverter())

    @Test
    fun `list - maps every preset matching the key to a record`() {
        val preset = FilterPreset(id = UUID.randomUUID(), presetKey = "operations", name = "This month", filter = mapOf("month" to "current"))
        whenever(filterPresetRepository.findAll(any<Specification<FilterPreset>>(), any<Sort>())).thenReturn(listOf(preset))

        val result = service.list("operations")

        assertThat(result).extracting("id").containsExactly(preset.id)
        assertThat(result.first().filter).isEqualTo(mapOf("month" to "current"))
    }

    @Test
    fun `create - always inserts a new preset`() {
        whenever(filterPresetRepository.save(any<FilterPreset>())).thenAnswer { it.arguments[0] as FilterPreset }

        val result = service.create(FilterPresetRecord(id = null, presetKey = "operations", name = "This month", filter = emptyMap()))

        assertThat(result.presetKey).isEqualTo("operations")
        assertThat(result.name).isEqualTo("This month")
    }

    @Test
    fun `delete - removes the preset by id`() {
        val id = UUID.randomUUID()
        val preset = FilterPreset(id = id, presetKey = "operations", name = "This month")
        whenever(filterPresetRepository.findById(id)).thenReturn(Optional.of(preset))

        service.delete(id)

        verify(filterPresetRepository).delete(preset)
    }
}
