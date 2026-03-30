package com.evgenltd.financemanager.tag.converter

import com.evgenltd.financemanager.tag.entity.Tag
import com.evgenltd.financemanager.tag.record.TagRecord
import org.springframework.stereotype.Service

@Service
class TagConverter {

    fun toRecord(entity: Tag): TagRecord = TagRecord(
        id = entity.id,
        name = entity.name,
        deleted = entity.deleted,
    )

    fun fillEntity(entity: Tag?, record: TagRecord): Tag = entity?.also {
        it.name = record.name
        it.deleted = record.deleted
    } ?: Tag(
        name = record.name,
        deleted = record.deleted,
    )

}
