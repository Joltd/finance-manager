package com.evgenltd.financemanager.config

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.scheduling.annotation.AsyncConfigurer
import org.springframework.core.task.SyncTaskExecutor
import java.util.concurrent.Executor

/**
 * Makes @Async event listeners execute synchronously in the calling thread during tests.
 * This ensures the HTTP request thread (which carries the tenant context set by TenantFilter)
 * also runs the balance calculation, making test assertions deterministic without polling.
 */
@TestConfiguration
class TestAsyncConfig : AsyncConfigurer {
    override fun getAsyncExecutor(): Executor = SyncTaskExecutor()
}