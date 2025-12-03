package com.evgenltd.financemanager.common.controller

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.service.SseService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter

@RestController
@SkipLogging
class SseController(
    private val sseService: SseService,
) {

    @GetMapping("/sse")
    @PreAuthorize("isAuthenticated()")
    fun sse(): SseEmitter? = sseService.subscribe()

}