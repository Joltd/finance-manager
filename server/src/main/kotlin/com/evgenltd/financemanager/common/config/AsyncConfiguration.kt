package com.evgenltd.financemanager.common.config

import com.evgenltd.financemanager.user.component.ContextPropagatingTaskDecorator
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.AsyncConfigurer
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import java.util.concurrent.Executor

@Configuration
@EnableAsync
class AsyncConfiguration(
    private val taskDecorator: ContextPropagatingTaskDecorator,
) : AsyncConfigurer {

    override fun getAsyncExecutor(): Executor = ThreadPoolTaskExecutor().apply {
        setTaskDecorator(taskDecorator)
        initialize()
    }

}