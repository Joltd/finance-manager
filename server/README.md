# Balance recalculation flow

This document describes only balance recalculation in `server`.

Out of scope: recalculation of ImportData totals (`ImportDataProcessService.calculateTotal` and related flow).

Diagram file: `docs/balance-recalculation-diagram.md`.

## Main participants

- `OperationController` - HTTP entry points for operation create/update/delete.
- `OperationProcessService` - detects account/currency/date changes and requests recalculation.
- `BalanceProcessService` - accepts recalculation requests, publishes events, runs async recalculation, and has scheduled retries.
- `BalanceActionService` - writes recalculation request metadata and computes `Balance`/`Turnover`.
- `BalanceRepository` - SQL upsert/conditional update for `calculation_date` and `calculation_version`.
- `LockService` - per-account/currency try-lock to avoid concurrent recalculation of the same balance.

## Entry points

### 1) Operation API (direct, synchronous)

- `POST /api/v1/operation` -> `OperationController.update` -> `OperationProcessService.update`.
- `DELETE /api/v1/operation/{id}` -> `OperationController.delete` -> `OperationProcessService.delete`.
- `DELETE /api/v1/operation` -> `OperationController.delete(ids)` -> `OperationProcessService.delete(ids)`.

All calls above are direct method calls in the request thread until event publication.

### 2) Import operation linking (direct, synchronous in that method)

- `ImportDataProcessService.linkOperation(...)` calls `OperationProcessService.update(...)`.

This uses the same balance recalculation chain as regular operation updates.
Only operation-driven recalculation is in scope here.

### 3) Scheduled retry (direct trigger + event)

- `BalanceProcessService.requestCalculateBalance()` is executed every 10 seconds (`@Scheduled(cron = "*/10 * * * * *")`).
- It finds balances with `calculation_date != null` and publishes `BalanceCalculationRequest` events.

## End-to-end flow

### Stage A - detect affected balances (direct, synchronous)

1. `OperationProcessService` saves/deletes operation via `OperationService`.
2. `OperationService` updates derived `Transaction` rows via `TransactionService.save/delete`.
3. `OperationProcessService.notifyChanges(...)` builds affected `(account, currency, date)` set from old/new operation states.
4. For each affected key it calls `BalanceProcessService.requestCalculateBalance(accountId, currency, date)`.

### Stage B - mark recalculation request (direct, synchronous)

`BalanceProcessService.requestCalculateBalance(accountId, currency, date)`:

1. Reads `currentTenant()`; if missing, request is skipped.
2. Calls `BalanceActionService.calculationRequest(...)`.
3. Publishes `BalanceCalculationRequest(accountId, currency)` via `ApplicationEventPublisher`.

`BalanceRepository.calculationRequest(...)` uses SQL upsert:

- inserts missing balance row with `calculation_date = requestedDate`, `calculation_version = 1`;
- or updates existing row only if current request is older (`excluded.calculation_date < balances.calculation_date`) or if recalculation is idle (`calculation_date is null`);
- increments `calculation_version` when request is accepted.

This effectively keeps the earliest pending recalculation date for the balance.

### Stage C - execute recalculation (event-driven, asynchronous)

`BalanceProcessService.requestCalculateBalance(event: BalanceCalculationRequest)` is:

- `@EventListener` -> triggered by Spring event bus;
- `@Async` -> executed on async executor, not in publisher thread.

Processing steps:

1. Acquire `withTryLock("Balance:<accountId>:<currency>")`.
2. If lock is busy, processing is skipped for this event instance.
3. Under lock call `BalanceActionService.calculateBalance(accountId, currency)`:
   - read balance row;
   - if `calculation_date/calculation_version` are null -> skip (already actual);
   - rebuild monthly `Turnover` from `calculation_date.withDayOfMonth(1)`;
   - compute cumulative amount and update `Balance.amount` and `Balance.date`.
4. If calculation returned a balance, call `BalanceActionService.calculationCompleted(id, calculationDate, calculationVersion)`.

`BalanceRepository.calculationCompleted(...)` clears `calculation_date/calculation_version` only when id/date/version still match.
This guards against stale completion in races.

5. If lock was acquired, publish `BalanceCalculationCompleted(accountId, currency)`.

Note: this completion event may be consumed by other bounded contexts, but ImportData totals recalculation is intentionally not described in this document.

### Stage D - eventual completion (scheduled + event)

If async event processing misses a run (for example lock contention or transient failure), pending rows remain with `calculation_date != null`.
The scheduler republishes requests every 10 seconds until completion clears the pending markers.

## Invocation type map

- Direct synchronous calls:
  - `OperationController` -> `OperationProcessService`
  - `OperationProcessService` -> `OperationService`
  - `OperationService` -> `TransactionService`
  - `OperationProcessService` -> `BalanceProcessService.requestCalculateBalance(accountId, currency, date)`
  - `BalanceProcessService` -> `BalanceActionService.calculationRequest`
- Event-driven calls:
  - `publishEvent(BalanceCalculationRequest)` -> `@EventListener requestCalculateBalance(event)`
  - `publishEvent(BalanceCalculationCompleted)` -> external listeners (not covered here)
- Asynchronous calls:
  - `@Async` on `BalanceProcessService.requestCalculateBalance(event)`
- Scheduled calls:
  - `@Scheduled` on `BalanceProcessService.requestCalculateBalance()`

## Important behavior details

- Recalculation is keyed by `(accountId, currency)` for locking.
- Request granularity includes `date`, but execution event includes only `(accountId, currency)`; the effective date comes from persisted `calculation_date` in `balances`.
- Older (earlier) request date has priority and can move recalculation window backward.
- Completion is optimistic and versioned via `calculation_version`.

