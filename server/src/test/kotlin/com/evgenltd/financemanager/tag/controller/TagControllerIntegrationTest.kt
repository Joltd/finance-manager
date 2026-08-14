package com.evgenltd.financemanager.tag.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.tag.entity.Tag
import com.evgenltd.financemanager.tag.record.TagRecord
import com.evgenltd.financemanager.tag.repository.TagRepository
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.util.UUID

class TagControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var tagRepository: TagRepository

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        withTenant { tagRepository.deleteAll() }
    }

    @Test
    fun `list - returns tags matching the mask, excluding deleted ones`() {
        withTenant {
            tagRepository.save(Tag(name = "Groceries"))
            tagRepository.save(Tag(name = "Travel"))
            tagRepository.save(Tag(name = "Groceries deleted", deleted = true))
        }

        val response = restClient.get()
            .uri("/api/v1/tag?mask=groc")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<TagRecord>>>() {})

        assertThat(response!!.success).isTrue()
        assertThat(response.body).extracting("name").containsExactly("Groceries")
    }

    @Test
    fun `byId - returns a single tag`() {
        val tag = withTenant { tagRepository.save(Tag(name = "Groceries")) }

        val response = restClient.get()
            .uri("/api/v1/tag/${tag.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<TagRecord>>() {})

        assertThat(response!!.body!!.name).isEqualTo("Groceries")
    }

    @Test
    fun `update - creates a new tag when the record has no id`() {
        val response = postTag(TagRecord(id = null, name = "Travel", deleted = false))
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)

        withTenant {
            assertThat(tagRepository.findAll()).extracting("name").containsExactly("Travel")
        }
    }

    @Test
    fun `update - modifies an existing tag in place`() {
        val tag = withTenant { tagRepository.save(Tag(name = "Old name")) }

        postTag(TagRecord(id = tag.id, name = "New name", deleted = false))

        withTenant {
            assertThat(tagRepository.find(tag.id!!).name).isEqualTo("New name")
        }
    }

    @Test
    fun `delete - hard deletes an unreferenced tag`() {
        val tag = withTenant { tagRepository.save(Tag(name = "Groceries")) }

        val response = restClient.delete()
            .uri("/api/v1/tag/${tag.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        withTenant { assertThat(tagRepository.findById(tag.id!!)).isEmpty() }
    }

    @Test
    fun `list - without a bearer token is rejected`() {
        val response = restClient.get()
            .uri("/api/v1/tag?mask=x")
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode.is4xxClientError).isTrue()
    }

    private fun postTag(record: TagRecord): ResponseEntity<String> =
        restClient.post()
            .uri("/api/v1/tag")
            .headers { it.addAll(authHeaders()) }
            .body(record)
            .retrieve()
            .toEntity(String::class.java)
}
