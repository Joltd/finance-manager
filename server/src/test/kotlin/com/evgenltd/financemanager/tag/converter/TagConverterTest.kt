package com.evgenltd.financemanager.tag.converter

import com.evgenltd.financemanager.tag.entity.Tag
import com.evgenltd.financemanager.tag.record.TagRecord
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.util.UUID

class TagConverterTest {

    private val converter = TagConverter()

    @Test
    fun `toRecord - maps entity fields to record`() {
        val entity = Tag(id = UUID.randomUUID(), name = "Groceries", deleted = false)

        val record = converter.toRecord(entity)

        assertThat(record.id).isEqualTo(entity.id)
        assertThat(record.name).isEqualTo("Groceries")
        assertThat(record.deleted).isFalse()
    }

    @Test
    fun `fillEntity - creates a new entity when given null`() {
        val record = TagRecord(id = null, name = "Travel", deleted = false)

        val entity = converter.fillEntity(null, record)

        assertThat(entity.id).isNull()
        assertThat(entity.name).isEqualTo("Travel")
        assertThat(entity.deleted).isFalse()
    }

    @Test
    fun `fillEntity - updates an existing entity in place`() {
        val existing = Tag(id = UUID.randomUUID(), name = "Old", deleted = false)
        val record = TagRecord(id = existing.id, name = "New", deleted = true)

        val entity = converter.fillEntity(existing, record)

        assertThat(entity).isSameAs(existing)
        assertThat(entity.name).isEqualTo("New")
        assertThat(entity.deleted).isTrue()
    }
}
