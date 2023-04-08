package com.evgenltd.financemanager.transaction.event

import org.springframework.context.ApplicationEvent
import java.time.LocalDate

class ResetGraphEvent(val date: LocalDate) : ApplicationEvent(date)