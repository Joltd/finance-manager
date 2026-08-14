package com.evgenltd.financemanager.testsupport

/**
 * Mirrors com.evgenltd.financemanager.common.record.Response for typed deserialization of the
 * @DataResponse envelope in controller tests, e.g.:
 *   restClient.get().uri(...).retrieve().body(object : ParameterizedTypeReference<ApiResponse<List<TagRecord>>>() {})
 */
data class ApiResponse<T>(
    val success: Boolean,
    val body: T?,
    val error: String?,
)
