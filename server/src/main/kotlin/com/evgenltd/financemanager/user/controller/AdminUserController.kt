package com.evgenltd.financemanager.user.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.common.util.badRequestException
import com.evgenltd.financemanager.user.record.AdminUserRecord
import com.evgenltd.financemanager.user.service.UserEventService
import com.evgenltd.financemanager.user.service.UserService
import com.evgenltd.financemanager.user.service.currentUser
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@DataResponse
@SkipLogging
class AdminUserController(
    private val userService: UserService,
    private val userEventService: UserEventService,
) : Loggable() {

    @GetMapping("/api/v1/admin/user")
    @PreAuthorize("hasRole('ADMIN')")
    fun list(): List<AdminUserRecord> = userService.adminList()

    @GetMapping("/api/v1/admin/user/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun byId(@PathVariable id: UUID): AdminUserRecord = userService.adminById(id)

    @PostMapping("/api/v1/admin/user")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(@RequestBody record: AdminUserRecord) {
        try {
            userService.adminUpdate(record)
                .also { userEventService.adminUser() }
        } catch (e: DataIntegrityViolationException) {
            log.error("Unable to save user", e)
            throw badRequestException("Login already in use")
        }
    }

    @DeleteMapping("/api/v1/admin/user/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: UUID) {
        if (currentUser() == id) {
            throw badRequestException("Unable to delete current user")
        }
        try {
            userService.adminDelete(id)
        } catch (_: Exception) {
            userService.adminMarkAsDelete(id)
        }
        userEventService.adminUser()
    }

}