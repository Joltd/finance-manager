package com.evgenltd.financemanager.common.config

import org.springframework.boot.task.ThreadPoolTaskExecutorBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.concurrent.Executor

@Configuration
class ExecutorConfig {

    @Bean(name = [BACKGROUND_CALCULATION_EXECUTOR])
    fun backgroundCalculationExecutor(): Executor = ThreadPoolTaskExecutorBuilder()
        .corePoolSize(4)
        .maxPoolSize(8)
        .queueCapacity(100)
        .threadNamePrefix("backgroundCalculation-")
        .build()

    companion object {
        const val BACKGROUND_CALCULATION_EXECUTOR = "backgroundCalculationExecutor"
    }

}