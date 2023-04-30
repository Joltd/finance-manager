package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.GraphState
import org.springframework.data.mongodb.repository.MongoRepository

interface GraphStateRepository : MongoRepository<GraphState,String> {

}