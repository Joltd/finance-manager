package com.evgenltd.financemanager.filterpreset.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.filterpreset.entity.FilterPreset
import com.evgenltd.financemanager.filterpreset.record.FilterPresetRecord
import com.evgenltd.financemanager.filterpreset.repository.FilterPresetRepository
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpStatus

class FilterPresetControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var filterPresetRepository: FilterPresetRepository

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        withTenant { filterPresetRepository.deleteAll() }
    }

    @Test
    fun `list - returns only presets for the given key`() {
        withTenant {
            filterPresetRepository.save(FilterPreset(presetKey = "operations", name = "This month", filter = mapOf("month" to "current")))
            filterPresetRepository.save(FilterPreset(presetKey = "pricing", name = "Other preset"))
        }

        val response = restClient.get()
            .uri("/api/v1/filter-preset?presetKey=operations")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<FilterPresetRecord>>>() {})

        assertThat(response!!.body).extracting("name").containsExactly("This month")
        assertThat(response.body!!.first().filter).isEqualTo(mapOf("month" to "current"))
    }

    @Test
    fun `create - always inserts a new preset`() {
        val response = restClient.post()
            .uri("/api/v1/filter-preset")
            .headers { it.addAll(authHeaders()) }
            .body(FilterPresetRecord(id = null, presetKey = "operations", name = "This month", filter = emptyMap()))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        withTenant {
            assertThat(filterPresetRepository.findAll()).extracting("presetKey", "name")
                .containsExactly(org.assertj.core.groups.Tuple.tuple("operations", "This month"))
        }
    }

    @Test
    fun `delete - removes the preset`() {
        val preset = withTenant { filterPresetRepository.save(FilterPreset(presetKey = "operations", name = "This month")) }

        val response = restClient.delete()
            .uri("/api/v1/filter-preset/${preset.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        withTenant { assertThat(filterPresetRepository.findById(preset.id!!)).isEmpty() }
    }
}
