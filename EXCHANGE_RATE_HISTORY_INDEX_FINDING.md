# Находка: `ExchangeRateHistoryIndex` может занулять суммы для одиночной транзакции в неделе

## Кратко

При расчёте отчётов (`ReportService.topFlowReport` / `taggedFlowReport` / `incomeExpenseReport`) и
дашборда (`DashboardService.load`) суммы конвертируются через
`ExchangeRateHistoryIndex.toTarget(date, amount)`. Если диапазон дат, за который запрашивается
история курсов, случайно схлопывается в **нулевую ширину** (`from == to`), то ни один
`ExchangeRateHistory` не подтягивается для этой недели — и сумма превращается в `0`, **даже если
валюта транзакции совпадает с целевой валютой** (то есть конвертация вообще не должна была
требовать курса).

Баг обнаружен при написании `ReportControllerIntegrationTest` (Phase 3, тесты контроллеров) —
тест с единственной транзакцией, датированной ровно на понедельник, стабильно возвращал пустой
результат, хотя транзакция корректно проходила через все фильтры и была в диапазоне дат отчёта.

## Где искать

- `server/src/main/kotlin/com/evgenltd/financemanager/exchangerate/service/ExchangeRateService.kt`
  — метод `historyRates(range, currencies)` (~строки 59-80).
- `server/src/main/kotlin/com/evgenltd/financemanager/common/service/extension.kt`
  — `LocalDate.withMonday()` (previousOrSame MONDAY) и `LocalDate.withNextMonday()` (nextOrSame MONDAY).
- `server/src/main/kotlin/com/evgenltd/financemanager/common/repository/extension.kt`
  — `infix fun ... between(range: Range<F>?)` → `(this gte range.from) and (this lt range.to)`,
    то есть полуоткрытый интервал `[from, to)`.
- `server/src/main/kotlin/com/evgenltd/financemanager/exchangerate/record/rate-index.kt`
  — `ExchangeRateHistoryIndex.toTarget(date, amount)`: если для даты нет записи в `index`,
    метод возвращает `Amount(0, targetCurrency)` **безусловно**, даже если исходная и целевая
    валюта совпадают. У `ExchangeRateIndex.toTarget(amount)` (без даты, используется, например,
    для `totalBalance` в дашборде) есть explicit same-currency shortcut в самом начале метода —
    у `ExchangeRateHistoryIndex` такого шортката нет, он появляется только «случайно», если для
    даты нашёлся `ExchangeRateIndex` с непустым `rates`.

## Механизм бага

1. Отчёт вычисляет `actualRange = Range(transactions.minOf{it.date}, transactions.maxOf{it.date})`.
   Если в выборке **ровно одна транзакция**, `min == max` — диапазон представляет собой одну дату.
2. `historyRates` строит `actualRange = Range(range.from?.withMonday(), range.to?.withNextMonday())`.
   - `withMonday()` — предыдущий или тот же понедельник.
   - `withNextMonday()` — следующий или тот же понедельник (`TemporalAdjusters.nextOrSame`).
3. Если дата транзакции сама оказывается понедельником, то:
   - `from = date.withMonday()` = сама дата (уже понедельник);
   - `to = date.withNextMonday()` = **та же самая дата** (`nextOrSame` включает "тот же день").
4. Получаем `Range(X, X)`. Фильтр `between` использует `[from, to)` — то есть `date >= X AND date < X`.
   Это условие **никогда не выполняется**, даже если в базе реально есть
   `ExchangeRateHistory(date = X, ...)`.
5. В результате `historyRates` возвращает пустую карту дат → `ExchangeRateHistoryIndex.index` пуст
   для всех дат → `toTarget(date, amount)` для любой даты возвращает `Amount(0, targetCurrency)`,
   независимо от валюты. Все суммы в отчёте обнуляются и отфильтровываются как "isNotZero() == false".

## Когда это проявляется в проде

Не только для «ровно одной транзакции». Условие срабатывает всегда, когда
`transactions.minOf{date}` (после `.withMonday()`) совпадает с
`transactions.maxOf{date}` (после `.withNextMonday()`), что в общем случае происходит, когда
**все транзакции в выборке попадают в одну и ту же календарную неделю, и `maxOf{date}` сама
оказывается понедельником**. Например: отчёт за диапазон, где все операции попали строго на
один понедельник (или, шире, где нет операций после последнего понедельника перед `to`).

Также стоит проверить логику по краям диапазона в целом — не только "единственная транзакция",
а любой случай, где после `withMonday()`/`withNextMonday()` границы совпадают.

## Как воспроизвести (тест-кейс)

Файл: `server/src/test/kotlin/com/evgenltd/financemanager/report/controller/ReportControllerIntegrationTest.kt`

В комментариях там же зафиксирован обходной путь (тест намеренно НЕ ставит транзакцию ровно на
понедельник, на который посеян курс, а на следующий день недели) — см. комментарии
`topFlowReport`/`taggedFlowReport` тестов.

Минимальный сценарий для ручной проверки:
1. Создать `Account` (ACCOUNT) и `Account` (EXPENSE).
2. Создать `Operation` (EXPENSE) на **понедельник**, например `2024-01-15` (это реальный понедельник).
3. Создать `ExchangeRateHistory(date = 2024-01-15, currency = "USD", value = 1)`.
4. Вызвать `POST /api/v1/report/top-flow` с диапазоном дат, покрывающим январь 2024, и с валютой
   транзакции = "USD" (равной целевой валюте по умолчанию).
5. Ожидание: сумма транзакции должна попасть в отчёт (сумма = сумме транзакции, конвертация не
   нужна, валюты совпадают). Факт: `groups` пустой, сумма обнулилась.

## Возможные направления фикса (не реализовано, на усмотрение)

- Добавить same-currency shortcut в `ExchangeRateHistoryIndex.toTarget(date, amount)`, аналогично
  тому, что уже есть в `ExchangeRateIndex.toTarget(amount)` — тогда даже без курса за нужную неделю
  суммы в исходной валюте не будут теряться.
- И/или поправить `historyRates`/`actualRange` так, чтобы граничные случаи (`from == to`) не
  создавали вырожденный (нулевой ширины) интервал — например, `to = to.plusDays(1)` перед
  `withNextMonday()`, или использовать включающую (`<=`) верхнюю границу для этого конкретного
  запроса.

## Статус

Баг **не исправлен** — сознательно оставлен как есть по договорённости с пользователем
(2026-08-14), тесты подстроены так, чтобы не попадать в этот вырожденный случай. Требует
отдельного решения о том, чинить ли и как именно.
