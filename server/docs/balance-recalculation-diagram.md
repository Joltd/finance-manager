# Balance recalculation diagram

This file contains a visual representation of the balance recalculation flow.

Out of scope: ImportData totals recalculation (`ImportDataProcessService.calculateTotal` and related events).

## Simplified diagram

```mermaid
flowchart TD
    OP["OperationProcessService<br/>requestCalculateBalance account/currency/date"]
    SCH["Scheduler every 10s<br/>BalanceProcessService.requestCalculateBalance"]

    EVT1[["Event: BalanceCalculationRequest"]]
    EVT2[["Event: BalanceCalculationRequest"]]

    CORE[["BalanceProcessService @EventListener + @Async<br/>Central recalculation block<br/>1) try lock by account-currency<br/>2) calculate balance and turnover<br/>3) on success clear calculation_date/calculation_version"]]

    DONE["Publish notification<br/>BalanceCalculationCompleted"]

    OP --> EVT1 --> CORE
    SCH --> EVT2 --> CORE
    CORE --> DONE
```

## Legend

- Central recalculation block is always asynchronous (`@Async`).
- Both incoming paths enter the central block via `BalanceCalculationRequest` events.
- `BalanceCalculationCompleted` is sent after successful processing in the central block.

