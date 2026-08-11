package com.evgenltd.financemanager.user.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.common.util.badRequestException
import com.evgenltd.financemanager.user.component.withTenant
import com.evgenltd.financemanager.user.record.AdminUserRecord
import com.evgenltd.financemanager.user.service.DemoDataGeneratorService
import com.evgenltd.financemanager.user.service.UserService
import com.evgenltd.financemanager.user.service.currentUser
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@DataResponse
@SkipLogging
class AdminUserController(
    private val userService: UserService,
    private val demoDataGeneratorService: DemoDataGeneratorService,
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
        val saved = try {
            userService.adminUpdate(record)
        } catch (e: DataIntegrityViolationException) {
            log.error("Unable to save user", e)
            throw badRequestException("Login already in use")
        }

        if (record.id == null && record.demo) {
            try {
                demoDataGeneratorService.generate(saved.tenant!!)
            } catch (e: Exception) {
                log.error("Unable to generate demo data for tenant ${saved.tenant}", e)
                throw badRequestException("User was created but demo data generation failed")
            }
        }
    }

    @DeleteMapping("/api/v1/admin/user/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: UUID) {
        if (currentUser() == id) {
            throw badRequestException("Unable to delete current user")
        }

        val target = userService.adminById(id)
        if (target.demo) {
            val tenant = target.tenant ?: throw badRequestException("Demo user has no tenant")
            withTenant(tenant) {
                userService.deleteDemoUser(id)
            }
            return
        }

        try {
            userService.adminDelete(id)
        } catch (_: Exception) {
            userService.adminMarkAsDelete(id)
        }
    }

}