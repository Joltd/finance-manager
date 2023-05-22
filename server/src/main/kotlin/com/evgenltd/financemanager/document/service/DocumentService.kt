package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.entity.Document
import com.evgenltd.financemanager.document.record.*
import com.evgenltd.financemanager.document.repository.DocumentRepository
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.isEqualTo
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import javax.annotation.PostConstruct

@Service
class DocumentService(
        private val documentRepository: DocumentRepository,
        private val mongoTemplate: MongoTemplate,
        private val transactionService: TransactionService,
        private val documentTypedServices: List<DocumentTypedService<*,*>>
) {

    private lateinit var index: Map<String,DocumentTypedService<*,*>>

    @PostConstruct
    fun postConstruct() {
        index = documentTypedServices.associateBy { resolveType(it) }
    }

    fun list(): List<DocumentTypedRecord> = documentRepository.findAll().map(::toTypedRecord)

    fun list(filter: DocumentFilter): DocumentPage {
        var query = filter.query()
        val count = mongoTemplate.count(query, Document::class.java)
        query = query.with(Sort.by(Sort.Direction.DESC, "date"))
                .with(PageRequest.of(filter.page, filter.size))
        return DocumentPage(
                count,
                filter.page,
                filter.size,
                mongoTemplate.find(query, Document::class.java).map(::toTypedRecord)
        )
    }

    private fun DocumentFilter.query(): Query {
        val criteriaList = mutableListOf(Criteria.where("").isEqualTo(""))

        dateFrom
                ?.let { Criteria.where("date").gte(it) }
                ?.let { criteriaList.add(it) }
        dateTo
                ?.let { Criteria.where("date").lt(it) }
                ?.let { criteriaList.add(it) }
        type
                ?.let {
                    Criteria.where("_class").regex(".*$it", "i")
                }
                ?.let { criteriaList.add(it) }
        if (categories.isNotEmpty()) {
            Criteria().orOperator(
                Criteria.where("expenseCategory").`in`(categories),
                Criteria.where("incomeCategory").`in`(categories)
            ).let { criteriaList.add(it) }
        }
        currency
                ?.let {
                    Criteria().orOperator(
                            Criteria.where("amount.currency").isEqualTo(it),
                            Criteria.where("amountFrom.currency").isEqualTo(it),
                            Criteria.where("amountTo.currency").isEqualTo(it)
                    )
                }
                ?.let { criteriaList.add(it) }
        account
                ?.let {
                    Criteria().orOperator(
                            Criteria.where("account").isEqualTo(it),
                            Criteria.where("accountFrom").isEqualTo(it),
                            Criteria.where("accountTo").isEqualTo(it),
                    )
                }
                ?.let { criteriaList.add(it) }

        return Query().addCriteria(Criteria().andOperator(criteriaList))
    }

    fun listDaily(filter: DocumentDailyFilter): List<DocumentTypedRecord> {
        val query = DocumentFilter(
            dateFrom = filter.date,
            dateTo = filter.date.plusDays(1L),
            account = filter.account
        ).query()
        return mongoTemplate.find(query, Document::class.java).map(::toTypedRecord)
    }

    fun byId(id: String): DocumentTypedRecord = documentRepository.find(id).let(::toTypedRecord)

    @Transactional
    fun update(record: DocumentTypedRecord) {
        val service = resolveService(record.value)
        val entity = service.toEntity(record.value)
        service.update(entity)
    }

    @Transactional
    fun update(entity: Document) = resolveService(entity).update(entity)

    @Transactional
    fun delete(id: String) {
        transactionService.deleteByDocument(id)
        documentRepository.deleteById(id)
    }

    fun findDocumentByAccount(account: String?): List<DocumentTypedRecord> {
        if (account == null) {
            return documentRepository.findAll().map(::toTypedRecord)
        }
        val documents = transactionService.findByAccount(account).map { it.document }
        return documentRepository.findAllById(documents).map(::toTypedRecord)
    }

    @Transactional
    fun deleteByAccount(account: String) {
        transactionService.findByAccount(account)
            .map { it.document }
            .distinct()
            .onEach {
                transactionService.deleteByDocument(it)
                documentRepository.deleteById(it)
            }
    }

    fun toEntity(record: DocumentRecord): Document = resolveService(record).toEntity(record)

    fun toRecord(entity: Document): DocumentRecord = resolveService(entity).toRecord(entity)

    fun toTypedRecord(entity: Document): DocumentTypedRecord = DocumentTypedRecord(
            resolveType(entity),
            toRecord(entity)
    )

    @Transactional
    @Async
    fun handleDocuments() {
        transactionService.deleteAll()
        documentRepository.findAll().onEach {
            update(it)
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun resolveService(any: Any): DocumentTypedService<Document, DocumentRecord> {
        val type = resolveType(any)
        return (index[type] ?: throw IllegalArgumentException("Unknown type $type")) as DocumentTypedService<Document, DocumentRecord>
    }

    private fun resolveType(any: Any): String = any::class.simpleName!!
            .replace("Record", "")
            .replace("Document", "")
            .replace("Service", "")
            .lowercase()

}