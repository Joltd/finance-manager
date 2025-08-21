package com.evgenltd.financemanager.common.component

@Target(AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
annotation class TaskVersion(val reversed: Boolean = false)
