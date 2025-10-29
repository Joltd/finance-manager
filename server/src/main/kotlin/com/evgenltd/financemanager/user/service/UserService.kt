package com.evgenltd.financemanager.user.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.badRequestException
import com.evgenltd.financemanager.common.util.unauthorizedException
import com.evgenltd.financemanager.settings.service.SettingService
import com.evgenltd.financemanager.user.converter.UserConverter
import com.evgenltd.financemanager.user.record.AdminUserRecord
import com.evgenltd.financemanager.user.record.ApplicationUser
import com.evgenltd.financemanager.user.record.UserRecord
import com.evgenltd.financemanager.user.repository.UserRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@SkipLogging
class UserService(
    private val userRepository: UserRepository,
    private val userConverter: UserConverter,
    private val settingService: SettingService,
    private val passwordEncoder: PasswordEncoder,
) : UserDetailsService {

    fun adminList(): List<AdminUserRecord> = userRepository.findAll()
        .map { userConverter.toAdminRecord(it)}

    fun adminById(id: UUID): AdminUserRecord = userRepository.find(id)
        .let { userConverter.toAdminRecord(it) }

    fun byIdOrNull(id: UUID): UserRecord? {
        val user = userRepository.findByIdOrNull(id) ?: return null
        val settings = settingService.loadRecord()
        return userConverter.toRecord(user, settings)
    }

    @Transactional
    fun adminUpdate(record: AdminUserRecord) {
        val user = userRepository.find(record.id)
        user.tenant = record.tenant
        user.name = record.name
        user.login = record.login
        user.deleted = record.deleted

        if (record.password != null) {
            if (record.password.length < 8) {
                throw badRequestException("Password must be 8 characters long")
            }
            user.password = passwordEncoder.encode(record.password)
        }

        userRepository.save(user)
    }

    @Transactional
    fun update(id: UUID, request: UserRecord) {
        val user = userRepository.findByIdOrNull(id)
            ?: throw unauthorizedException()
        user.name = request.name
        settingService.updateRecord(request.settings)
    }

    @Transactional
    fun adminDelete(id: UUID) {
        val user = userRepository.find(id)
        userRepository.delete(user)
    }

    @Transactional
    fun adminMarkAsDelete(id: UUID) {
        val user = userRepository.find(id)
        user.deleted = true
        userRepository.save(user)
    }

    override fun loadUserByUsername(username: String?): UserDetails? {
        if (username.isNullOrBlank()) {
            throw BadCredentialsException("Username is not specified")
        }

        val user = userRepository.findByLoginAndDeletedIsFalse(username)
            ?: throw BadCredentialsException("User not found")

        return ApplicationUser(
            id = user.id!!,
            login = user.login,
            password = user.password,
            role = user.role,
            tenant = user.tenant,
            deleted = user.deleted,
        )
    }

}