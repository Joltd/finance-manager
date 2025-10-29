package com.evgenltd.financemanager.ai.controller

import com.evgenltd.financemanager.ai.record.EmbeddingVectorRecord
import com.evgenltd.financemanager.ai.service.EmbeddingService
import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@DataResponse
class EmbeddingController(
    private val embeddingService: EmbeddingService,
) {

    @SkipLogging
    @GetMapping("/api/v1/embedding/{id}/vector")
    @PreAuthorize("hasRole('USER')")
    fun vector(@PathVariable id: UUID): EmbeddingVectorRecord? = embeddingService.vector(id)

}