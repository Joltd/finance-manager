package com.evgenltd.financemanager.common.util

import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.math.BigDecimal
import java.math.RoundingMode

fun unauthorizedException(): ResponseStatusException = ResponseStatusException(HttpStatus.UNAUTHORIZED)

fun badRequestException(message: String? = null): ResponseStatusException = ResponseStatusException(HttpStatus.BAD_REQUEST, message)

fun BigDecimal.oppositeRate(): BigDecimal = BigDecimal.ONE.divide(this, Amount.SCALE * 2, RoundingMode.HALF_UP)
