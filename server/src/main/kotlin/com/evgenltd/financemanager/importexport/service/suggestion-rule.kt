package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.importexport.record.SuggestionRating

fun suggestionRating(score: Double?): SuggestionRating? = when {
    score == null -> null
    score > 1000 -> SuggestionRating.GOOD
    score > 1 -> SuggestionRating.FAIR
    else -> SuggestionRating.POOR
}

fun isFairSuggestionRating(score: Double?): Boolean = score != null && score > 1