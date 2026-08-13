package com.evgenltd.financemanager.testsupport.fixture

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.record.AccountRecord

fun accountRecordOf(account: Account): AccountRecord = AccountRecord(
    id = account.id,
    name = account.name,
    type = account.type,
    parser = null,
    deleted = false,
    reviseDate = null,
)
