package com.evgenltd.financemanager.common.component

/**
 * Annotation to mark services and controllers that should be excluded from logging by LoggerAspect.
 * Can be applied to classes or methods.
 */
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
annotation class SkipLogging