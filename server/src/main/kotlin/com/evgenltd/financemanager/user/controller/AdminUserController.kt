package com.evgenltd.financemanager.user.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.util.badRequestException
import com.evgenltd.financemanager.user.record.AdminUserRecord
import com.evgenltd.financemanager.user.service.UserService
import com.evgenltd.financemanager.user.service.currentUser
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
) {

    @GetMapping("/api/v1/admin/user")
    @PreAuthorize("hasRole('ADMIN')")
    fun list(): List<AdminUserRecord> {
//        throw badRequestException("Test")
        return userService.adminList()
    }

    @GetMapping("/api/v1/admin/user/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun byId(@PathVariable id: UUID): AdminUserRecord = userService.adminById(id)

    @PostMapping("/api/v1/admin/user")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(@RequestBody record: AdminUserRecord) {
        throw badRequestException("Test post")
//        userService.adminUpdate(record)
    }

    @DeleteMapping("/api/v1/admin/user/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: UUID) {
        if (currentUser() == id) {
            throw badRequestException("Unable to delete current user")
        }
        try {
            userService.adminDelete(id)
        } catch (e: Exception) {
            userService.adminMarkAsDelete(id)
        }
    }

}