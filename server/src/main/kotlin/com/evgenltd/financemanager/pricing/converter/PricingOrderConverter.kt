package com.evgenltd.financemanager.pricing.converter

import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.record.PricingOrderRecord
import org.springframework.stereotype.Service

@Service
class PricingOrderConverter(
    private val pricingItemConverter: PricingItemConverter,
) {



}