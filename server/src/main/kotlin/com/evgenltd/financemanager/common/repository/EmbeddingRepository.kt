package com.evgenltd.financemanager.common.repository

import com.evgenltd.financemanager.common.entity.Embedding
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface EmbeddingRepository : JpaRepository<Embedding, UUID>