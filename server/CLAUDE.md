# Server — Backend

Kotlin + Spring Boot 4, PostgreSQL, Flyway, Hibernate (multi-tenancy discriminator).

## Stack

| Purpose | Library |
|---|---|
| Framework | Spring Boot 4 (Web, Data JPA, Security, Batch, Integration) |
| Language | Kotlin 2 + JDK 21 |
| DB | PostgreSQL, Flyway migrations |
| ORM | Hibernate 7 (JPA), `@TenantId` discriminator multi-tenancy |
| Auth | JWT (HS512), OAuth2 Resource Server |
| Async | Spring `@Async` with context-propagating decorator |
| Real-time | Server-Sent Events (SSE) |
| Build | Gradle (Kotlin DSL) |

## Module structure

Each domain module follows the same package layout:

```
<domain>/
├── controller/   — REST endpoints
├── service/      — business logic
├── repository/   — Spring Data JPA interfaces
├── converter/    — Entity ↔ Record mapping
├── entity/       — JPA entities
└── record/       — Kotlin data classes (DTOs)
```

Domains: `account`, `operation`, `report`, `ai`, `exchangerate`, `importexport`, `user`, `settings`, `pricing`, `taxes`, `entity`, `common`.

## Layer conventions

### Controller

- Base path: `/api/v1/<domain>`
- Annotate class with `@RestController` + `@DataResponse` (AOP wrapper, wraps response in `{ body, success, error }`)
- All non-public endpoints require `@PreAuthorize("hasRole('USER')")`
- Methods return `*Record` types, never entities
- Use `@SkipLogging` to suppress the auto-logging aspect when needed

```kotlin
@RestController
@DataResponse
class AccountController(private val accountService: AccountService) {

    @GetMapping("/api/v1/account")
    @PreAuthorize("hasRole('USER')")
    fun list(@RequestParam type: AccountType?): List<AccountRecord> =
        accountService.list(type)
}
```

### Service

Three service subtypes within a domain:

| Type | Responsibility |
|---|---|
| Core service (`AccountService`) | CRUD, queries, business rules. `@Transactional` on mutating methods. |
| Process service (`OperationProcessService`) | Orchestrates between services, triggers notifications, maintains derived data. |
| Event service (`AccountEventService`) | Sends SSE events via `@SseEventMapping`. |

- Inject dependencies via constructor
- Return `*Record` from methods called by controllers
- Throw `badRequestException(message)` / `unauthorizedException()` for error cases

```kotlin
@Service
class AccountService(
    private val accountRepository: AccountRepository,
    private val accountConverter: AccountConverter,
) {
    fun list(type: AccountType?): List<AccountRecord> =
        accountRepository.findAll(Account::type eq type)
            .map { accountConverter.toRecord(it) }

    @Transactional
    fun update(record: AccountRecord): AccountRecord =
        record.id?.let { accountRepository.findByIdOrNull(it) }
            .let { accountConverter.fillEntity(it, record) }
            .let { accountRepository.save(it) }
            .let { accountConverter.toRecord(it) }
}
```

### Repository

- Extend `JpaRepository<T, UUID>` + `JpaSpecificationExecutor<T>`
- Custom queries with `@Query` only when Specification DSL is insufficient
- **Never write raw JPA criteria in services** — use the Specification DSL below

```kotlin
@Repository
interface AccountRepository : JpaRepository<Account, UUID>, JpaSpecificationExecutor<Account> {
    @Query("select max(a.reviseDate) from Account a")
    fun findLastReviseDate(): LocalDate?
}
```

### Converter

Two mandatory methods per converter:

- `toRecord(entity: T): TRecord` — entity to DTO
- `fillEntity(entity: T?, record: TRecord): T` — fill existing or create new entity from DTO

Optional:
- `toReference(entity: T): Reference` — lightweight reference `{ id, name, deleted? }`
- `toChangeRecord(entity: T): TChangeRecord` — snapshot for change tracking

```kotlin
@Service
class AccountConverter(private val groupRepository: AccountGroupRepository) {

    fun toRecord(entity: Account): AccountRecord = AccountRecord(
        id = entity.id,
        name = entity.name,
        type = entity.type,
        group = entity.group?.let { groupConverter.toRecord(it) },
    )

    fun fillEntity(entity: Account?, record: AccountRecord): Account =
        entity?.also {
            it.name = record.name
            it.type = record.type
        } ?: Account(name = record.name, type = record.type)
}
```

### Entity

- UUID PK with `@GeneratedValue(strategy = GenerationType.UUID)`
- `@TenantId` on the tenant field — Hibernate filters all queries automatically
- Soft delete via `deleted: Boolean = false`
- Use `@Embeddable` / `@Embedded` for value objects (`Amount`)
- JSON columns via `@JdbcTypeCode(SqlTypes.JSON)`

```kotlin
@Entity
@Table(name = "accounts")
class Account(
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    @TenantId
    var tenant: UUID? = null,

    var name: String,

    @Enumerated(EnumType.STRING)
    var type: AccountType,

    @ManyToOne @JoinColumn(name = "group_id")
    var group: AccountGroup? = null,

    var deleted: Boolean = false,
)
```

### Record (DTO)

- Always `data class`
- Nullable `id` (null on create, non-null on update)
- Use nested records for relations (not plain IDs)

## Specification DSL

Infix extension functions in `common/repository/` for building `Specification<T>`:

```kotlin
// Equality / null check
Account::type eq AccountType.ACCOUNT
Account::deleted eq false

// Like
Account::name like "%john%"

// Comparison
Operation::date gt LocalDate.now()
Operation::date between DateRange(from, to)

// Contains (IN clause)
Operation::date contains listOf(date1, date2)

// Amount embedded
Operation::amountFrom currency "USD"
Operation::amountFrom amountBetween BigDecimalRange(from, to)

// Combine
val spec = (Account::type eq type) and (Account::deleted eq false)
accountRepository.findAll(spec, Sort.by(Account::name.name))
```

## Amount value object

Money is stored as `Amount(value: Long, currency: String)` where `value` uses scale 4:
- `Amount(12345, "USD")` = 1.2345 USD
- Arithmetic operators: `+`, `-`, `*`
- `amount.toBigDecimal()` — convert for display
- `bigDecimal.toAmountValue()` — convert for storage
- Never use `BigDecimal` directly in entities

```kotlin
@Embeddable
data class Amount(val value: Long, val currency: String)

// Attribute overrides when embedding multiple amounts in one entity
@Embedded
@AttributeOverrides(
    AttributeOverride(name = "value",    column = Column(name = "amount_from_value")),
    AttributeOverride(name = "currency", column = Column(name = "amount_from_currency")),
)
var amountFrom: Amount,
```

## Multi-tenancy

- Strategy: Hibernate discriminator (`@TenantId` column on every entity)
- Current tenant is resolved from JWT claim `tenant` (UUID), stored in `ThreadLocal`
- `TenantFilter` sets the tenant context before each request
- All queries are automatically scoped — no manual `where tenant = ?` needed
- Async operations use `ContextPropagatingTaskDecorator` to preserve the tenant context across threads

## Security

- JWT HS512, stateless (no sessions)
- Access token: 15 min; refresh token: 7 days
- Authorities claim: `authorities`, prefix: `ROLE_`
- Public endpoints: `/api/public/**`
- Role check: `@PreAuthorize("hasRole('USER')")` on every protected endpoint

## SSE (Server-Sent Events)

Real-time push to frontend via `SseService`:

```kotlin
// 1. Annotate the service method that triggers the event
@SseEventMapping("/api/v1/account/{id}")
fun update(record: AccountRecord): AccountRecord { ... }

// 2. SseEventAspect picks it up, broadcasts to all connections of current tenant
```

- Per-tenant connection limit (default 10)
- Heartbeat every 10 s to keep connections alive
- SSE subscription supports `?token=` query parameter for auth

## Error handling

```kotlin
// In services / controllers
throw badRequestException("Name is blank")
throw unauthorizedException()
// These become 400 / 401 ResponseStatusException
```

## Logging

- `LoggerAspect` auto-logs enter/exit + timing for all service and controller methods
- Suppress with `@SkipLogging` on method or class
- Use `Loggable` base class for manual logging: `log.info(...)`
- MDC keys: `requestId`, `tenant`, `user` — propagated to async threads

## Seek (cursor pagination) pattern

Used in `operation` and similar list endpoints. The client sends:

```
pointer: <date or id>   — anchor position
direction: FORWARD | BACKWARD
```

Service finds N nearest items relative to the pointer. Frontend `SeekStore` calls `seekForward` / `seekBackward` on scroll.

## Database migrations

Flyway, PostgreSQL. Files in `src/main/resources/db/migration/`:
- Naming: `V{n}__{Description}.sql`
- `out-of-order: true` is enabled — new migrations can be added without renaming

Always create a new migration file for schema changes. Never modify existing migration files.
