package com.evgenltd.financemanager.common.config

import com.evgenltd.financemanager.user.component.ROOT_TENANT
import com.evgenltd.financemanager.user.component.withMdc
import com.evgenltd.financemanager.user.component.withRootTenant
import com.evgenltd.financemanager.user.component.withTenant
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.Trigger
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.SchedulingConfigurer
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import org.springframework.scheduling.config.ScheduledTaskRegistrar
import java.time.Duration
import java.time.Instant
import java.util.concurrent.ScheduledFuture

@Configuration
@EnableScheduling
class SchedulingConfiguration : SchedulingConfigurer {

    override fun configureTasks(taskRegistrar: ScheduledTaskRegistrar) {
        taskRegistrar.setTaskScheduler(buildScheduler())
    }

    private fun buildScheduler(): ThreadPoolTaskScheduler = object : ThreadPoolTaskScheduler() {
        init { initialize() }

        override fun schedule(task: Runnable, trigger: Trigger): ScheduledFuture<*>? =
            super.schedule(task.withContext(), trigger)

        override fun schedule(task: Runnable, startTime: Instant): ScheduledFuture<*> =
            super.schedule(task.withContext(), startTime)

        override fun scheduleAtFixedRate(task: Runnable, startTime: Instant, period: Duration): ScheduledFuture<*> =
            super.scheduleAtFixedRate(task.withContext(), startTime, period)

        override fun scheduleAtFixedRate(task: Runnable, period: Duration): ScheduledFuture<*> =
            super.scheduleAtFixedRate(task.withContext(), period)

        override fun scheduleWithFixedDelay(task: Runnable, startTime: Instant, delay: Duration): ScheduledFuture<*> =
            super.scheduleWithFixedDelay(task.withContext(), startTime, delay)

        override fun scheduleWithFixedDelay(task: Runnable, delay: Duration): ScheduledFuture<*> =
            super.scheduleWithFixedDelay(task.withContext(), delay)
    }

    private fun Runnable.withContext(): Runnable = Runnable {
        withTenant(ROOT_TENANT) {
            withMdc(tenant = ROOT_TENANT) {
                run()
            }
        }
    }

}
