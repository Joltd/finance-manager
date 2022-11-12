package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.document.entity.Document
import com.evgenltd.financemanager.document.record.DocumentRecord

interface DocumentTypedService<E : Document, R : DocumentRecord> {

    fun hash(record: R): String

    fun toRecord(entity: E): R

    fun toEntity(record: R): E

    fun update(entity: E)

}