package com.evgenltd.financemanager.importexport.component

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.fromFractionalString
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

fun String.date(pattern: String): LocalDate = LocalDate.parse(trim(), DateTimeFormatter.ofPattern(pattern))

fun String.dateTime(pattern: String): LocalDate = LocalDateTime.parse(trim(), DateTimeFormatter.ofPattern(pattern)).toLocalDate()

fun String.amount(currency: String): Amount = fromFractionalString(trim(), currency)