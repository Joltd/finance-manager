package com.evgenltd.financemanager.common.record

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.context.ApplicationEvent
import java.util.UUID

class NewTaskEvent : ApplicationEvent(Unit)