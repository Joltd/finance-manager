package com.evgenltd.financemanager.tag.service

import com.evgenltd.financemanager.tag.converter.TagConverter
import com.evgenltd.financemanager.tag.entity.Tag
import com.evgenltd.financemanager.tag.record.TagRecord
import com.evgenltd.financemanager.tag.repository.TagRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification
import java.util.Optional
import java.util.UUID

class TagServiceTest {

    private val tagRepository = mock<TagRepository>()
    private val service = TagService(tagRepository, TagConverter())

    @Test
    fun `list - maps every returned tag to a record`() {
        val tag = Tag(id = UUID.randomUUID(), name = "Groceries")
        whenever(tagRepository.findAll(any<Specification<Tag>>(), any<Sort>())).thenReturn(listOf(tag))

        val result = service.list(mask = null)

        assertThat(result).extracting("id").containsExactly(tag.id)
    }

    @Test
    fun `byId - looks up and converts the tag`() {
        val id = UUID.randomUUID()
        whenever(tagRepository.findById(id)).thenReturn(Optional.of(Tag(id = id, name = "Groceries")))

        assertThat(service.byId(id).name).isEqualTo("Groceries")
    }

    @Test
    fun `update - creates a new tag when the record has no id`() {
        whenever(tagRepository.save(any<Tag>())).thenAnswer { it.arguments[0] as Tag }

        val result = service.update(TagRecord(id = null, name = "Travel", deleted = false))

        assertThat(result.name).isEqualTo("Travel")
    }

    @Test
    fun `update - updates an existing tag in place`() {
        val id = UUID.randomUUID()
        whenever(tagRepository.findById(id)).thenReturn(Optional.of(Tag(id = id, name = "Old")))
        whenever(tagRepository.save(any<Tag>())).thenAnswer { it.arguments[0] as Tag }

        val result = service.update(TagRecord(id = id, name = "New", deleted = true))

        assertThat(result.name).isEqualTo("New")
        assertThat(result.deleted).isTrue()
    }

    @Test
    fun `delete - hard deletes when the repository allows it`() {
        val id = UUID.randomUUID()
        val tag = Tag(id = id, name = "Groceries")
        whenever(tagRepository.findById(id)).thenReturn(Optional.of(tag))

        service.delete(id)

        verify(tagRepository).delete(tag)
        verify(tagRepository, never()).save(any<Tag>())
    }

    @Test
    fun `delete - falls back to a soft delete when the hard delete fails`() {
        val id = UUID.randomUUID()
        val tag = Tag(id = id, name = "Groceries")
        whenever(tagRepository.findById(id)).thenReturn(Optional.of(tag))
        whenever(tagRepository.delete(tag)).thenThrow(RuntimeException("referenced by operations"))
        whenever(tagRepository.save(tag)).thenReturn(tag)

        service.delete(id)

        assertThat(tag.deleted).isTrue()
        verify(tagRepository).save(tag)
    }
}
