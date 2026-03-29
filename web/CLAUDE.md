# Web — Frontend

Next.js 16 (App Router), TypeScript, shadcn/ui, Tailwind CSS v4.

## Key libraries

| Purpose | Library |
|---|---|
| UI components | shadcn/ui + Radix UI |
| State management | Zustand |
| HTTP | Axios (`@/lib/axios`) |
| Forms | react-hook-form + zod |
| Charts | Recharts |
| Dates | date-fns, react-day-picker |
| Notifications | Sonner (toast) |
| DnD | @dnd-kit/core |
| Utilities | remeda, immer |

## Directory structure

```
web/src/
├── app/
│   ├── (protected)/
│   │   ├── (user)/       — main user pages
│   │   └── (admin)/      — admin pages
│   └── (public)/         — auth pages
├── api/          — URL constants per domain (e.g. operationUrls)
├── components/
│   ├── common/   — shared layout, filter, UI primitives
│   └── ui/       — shadcn/ui base components
├── hooks/        — useRequest, useDebounce, useMobile
├── lib/          — axios instance, utils, api helpers
├── store/        — Zustand stores (fetch, seek, dialog patterns)
└── types/        — TypeScript types per domain
```

## Layout architecture

All pages follow a Linear-inspired layout with these components from `@/components/common/layout/`:

| Component | Description |
|---|---|
| `<Layout>` | Root flex-col container. Prop `scrollable` adds `overflow-y-auto`. |
| `<PageHeader>` | `px-4 md:px-6 py-3 border-b`. Props: `title`, `description?`, `actions?`. |
| `<FilterBar>` | `px-4 md:px-6 py-2 border-b bg-muted/30`. Wraps `<Filter>`. |
| `<PageContent>` | `p-4 md:p-6 gap-6`. Prop `scrollable` makes it flex-1 + scroll. |
| `<Seek>` | Infinite scroll container. Accepts `className` for padding. |
| `<EntityList>` | Card-based list with title/subtitle/add-button. |
| `<Section>` | Section wrapper with header/description/actions. |
| `<Stack>` | Flex stack with gap/orientation/align variants. |
| `<Flow>` | Horizontal flex with wrap and alignment. |

### Standard page pattern

```tsx
<Layout scrollable>
  <PageHeader title="..." description="..." actions={<Button>...</Button>} />
  <FilterBar>
    <Filter value={filter} onChange={setFilter}>
      <FilterItem id="account" label="Account"><AccountFilter /></FilterItem>
    </Filter>
  </FilterBar>
  <PageContent scrollable>
    {content}
  </PageContent>
</Layout>
```

### Seek-based page pattern (infinite scroll, e.g. Operations)

```tsx
<Layout>
  <PageHeader title="..." />
  <FilterBar>...</FilterBar>
  <Seek className="flex-1 min-h-0 px-4 md:px-6 py-2">
    {items}
  </Seek>
</Layout>
```

Use `<Seek>` instead of `<PageContent scrollable>` when the page uses a seek store for pagination.

## Filter system

`@/components/common/filter/`

- `<Filter value onChange>` — context provider + renders active filter pills + "add filter" dropdown
- `<FilterItem id label>` — registers a filter, renders as a pill when active
- Specific filters: `AccountFilter`, `CurrencyFilter`, `DateFilter`, `MonthFilter`, `SelectFilter`
- Always wrap `<Filter>` inside `<FilterBar>`

## State management

### Fetch store — `createFetchStore`

For loading a single resource.

```ts
// Define in store/
export const useOperationStore = createFetchStore<Operation, unknown, unknown, { id: string }>(
  operationUrls.id,
)

// Use in component
const { data, loading, fetch, setPathParams } = useOperationStore()
useEffect(() => { setPathParams({ id }); fetch() }, [id])
```

### Seek store — `createSeekStore`

For paginated / infinite-scroll lists. Supports bidirectional seeking.

```ts
// Define in store/
export const useOperationSeekStore = createSeekStore<OperationGroup, string, OperationFilter>(
  operationUrls.root,
  (group) => group.date,  // pointer extractor
)

// Use in component
const { data, seekBackward, setBody, resetData } = useOperationSeekStore()
```

Key actions: `seekForward`, `seekBackward`, `refresh`, `resetData`, `reset`, `setBody`, `setQueryParams`.

### useRequest hook

For imperative mutations (create, update, delete).

```ts
const { submit, loading } = useRequest<ResponseType, BodyType>(
  operationUrls.id,
  { method: 'PUT' }
)
await submit({ body: data, pathParams: { id } })
```

## API conventions

- URL constants live in `src/api/<domain>.ts`, exported as `<domain>Urls`
- Path params use `:paramName` syntax: `/api/v1/operation/:id`
- All responses follow `{ body: T, success: boolean, error: string }`
- Errors are shown via `sonner` toast automatically in `useRequest`

## Pages

| Route | Component | Pattern |
|---|---|---|
| `/` | Dashboard | scrollable Layout |
| `/account` | AccountPage | scrollable Layout, EntityList |
| `/operation` | OperationPage | Seek-based |
| `/reference` | ReferencePage | scrollable Layout, EntityList |
| `/report/income-expense` | IncomeExpensePage | scrollable Layout |
| `/report/top-flow` | TopFlowPage | scrollable Layout |
| `/import-data` | ImportDataPage | — |
| `/settings` | SettingsPage | — |
