package com.evgenltd.financemanager.common.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.integration.jdbc.lock.DefaultLockRepository
import org.springframework.integration.jdbc.lock.JdbcLockRegistry
import org.springframework.integration.jdbc.lock.LockRepository
import java.time.Duration
import javax.sql.DataSource

@Configuration
class LockRegistryConfiguration {

    @Bean
    fun lockRepository(dataSource: DataSource): DefaultLockRepository =
        DefaultLockRepository(dataSource).apply {
            setRegion("entity-locks")
        }

    @Bean
    fun jdbcLockRegistry(lockRepository: LockRepository): JdbcLockRegistry =
        JdbcLockRegistry(lockRepository, Duration.ofMinutes(5))

}