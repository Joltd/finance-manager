package com.evgenltd.financemanager.reference.event

import org.springframework.context.ApplicationEvent
import java.time.LocalDate

class AccountActualOnEvent(
    val id: String,
    val date: LocalDate
) : ApplicationEvent(Unit)