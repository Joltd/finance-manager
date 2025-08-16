package com.evgenltd.financemanager.common.util

import java.math.BigDecimal
import java.math.RoundingMode

fun BigDecimal.oppositeRate(): BigDecimal = BigDecimal.ONE.divide(this, Amount.SCALE * 2, RoundingMode.HALF_UP)
