package com.evgenltd.financemanager.reference.entity

import java.time.LocalDate

class Account(
        var id: String?,
        var name: String,
        var deleted: Boolean = false,
        var track: Boolean = false,
        var actualOn: LocalDate? = null
)