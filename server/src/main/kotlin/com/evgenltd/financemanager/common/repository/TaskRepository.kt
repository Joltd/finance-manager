package com.evgenltd.financemanager.common.repository

import com.evgenltd.financemanager.common.entity.Task
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import java.util.*

interface TaskRepository : JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {

    @Modifying
    @Query("""
        insert into tasks (id, bean, method, key, version, progress, payload, started_at)
        values (
            gen_random_uuid(),
            :bean,
            :method,
            :key,
            :version,
            false,
            :payload,
            null
        )
        on conflict (bean, method, key, progress)
        do update set
            version = excluded.version,
            payload = excluded.payload
        where tasks.version <= :version
    """, nativeQuery = true
    )
    fun upsert(
        bean: String,
        method: String,
        key: String,
        version: Long,
        payload: ObjectNode
    ): Int

    @Query("""
        select t.id from tasks t
        left join tasks e on t.bean = e.bean and t.method = e.method and t.key = e.key and e.progress = true
        where t.progress = false and e.id is null
        limit 50
    """, nativeQuery = true)
    fun findForExecution(): List<UUID>

    @Modifying
    @Query("""
        update tasks t set progress = true, started_at = now()
        where 
            t.id = :id 
            and t.progress = false
            and not exists (
                select 1 from tasks e
                where
                    e.bean = t.bean
                    and e.method = t.method 
                    and e.key = t.key 
                    and e.progress = true
            )
    """, nativeQuery = true
    )
    fun lock(id: UUID): Int

    @Modifying
    @Query("delete from tasks where id = :id and progress = true", nativeQuery = true)
    fun unlock(id: UUID)

}