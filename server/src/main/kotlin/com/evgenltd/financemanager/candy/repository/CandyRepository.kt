package com.evgenltd.financemanager.candy.repository

import com.evgenltd.financemanager.candy.entity.Candy
import com.evgenltd.financemanager.candy.entity.Direction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CandyRepository : JpaRepository<Candy, UUID> {

    fun findFirstByDirectionOrderByDateDesc(direction: Direction): Candy?

}