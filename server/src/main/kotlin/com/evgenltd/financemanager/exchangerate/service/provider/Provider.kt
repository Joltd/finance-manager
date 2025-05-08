package com.evgenltd.financemanager.exchangerate.service.provider

enum class Provider {
    STUB,
    FREE_CURRENCY, // small set of pairs
    OPEN_EXCHANGE, // perfect choice
    EXCHANGE_RATE, // need to pay for history data
    COIN_GECKO,
}