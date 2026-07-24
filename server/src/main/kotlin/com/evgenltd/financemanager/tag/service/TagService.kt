package com.evgenltd.financemanager.tag.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.contains
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.like
import com.evgenltd.financemanager.tag.converter.TagConverter
import com.evgenltd.financemanager.tag.entity.Tag
import com.evgenltd.financemanager.tag.record.TagRecord
import com.evgenltd.financemanager.tag.repository.TagRepository
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
@SkipLogging
class TagService(
    private val tagRepository: TagRepository,
    private val tagConverter: TagConverter,
) {

    fun list(mask: String?, ids: List<UUID>? = null): List<TagRecord> {
        val filter = (Tag::name like mask) and (Tag::deleted eq false) and (Tag::id contains ids)
        return tagRepository.findAll(filter, Sort.by("name"))
            .map { tagConverter.toRecord(it) }
    }

    fun byId(id: UUID): TagRecord = tagRepository.find(id).let { tagConverter.toRecord(it) }

    @Transactional
    fun update(record: TagRecord): TagRecord = record.id
        ?.let { tagRepository.findByIdOrNull(it) }
        .let { tagConverter.fillEntity(it, record) }
        .let { tagRepository.save(it) }
        .let { tagConverter.toRecord(it) }

    fun delete(id: UUID) {
        try {
            val tag = tagRepository.find(id)
            tagRepository.delete(tag)
        } catch (e: Exception) {
            val tag = tagRepository.find(id)
            tag.deleted = true
            tagRepository.save(tag)
        }
    }

}
