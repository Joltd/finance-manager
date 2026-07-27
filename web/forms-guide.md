# Forms Guide

Audience: AI agents implementing or refactoring forms in `web/`. This documents the canonical
pattern for react-hook-form (RHF) + zod + shadcn/ui `Field` components used in this codebase,
derived from `web/src/app/(protected)/(user)/operation/operation-form.ts` +
`operation-sheet.tsx` + `import-data-entry-sheet.tsx`, which are the current reference
implementation. Follow it for any new form; when refactoring an existing form, prefer migrating
it to this pattern over extending the legacy style described in §11.

## 1. File layout

- **Component file** (`*-sheet.tsx` / `*-dialog.tsx` / a page): JSX orchestration, the
  open-state store, event handlers (`onSubmit`, `handleTypeChange`, ...).
- **Sibling `<feature>-form.ts`**: zod schema, inferred `FormState` type, resolver, and *pure*
  helper functions (no hooks, no store reads — all inputs passed as parameters). Extract into
  this file when either is true:
  - The same schema/state-shaping logic is needed by more than one component (e.g. a Sheet and
    an import/suggestion picker both building the same form state).
  - The resolver has non-trivial cross-field/conditional validation (`superRefine`) or the
    state-shaping logic (type transitions, domain-object → form-state conversion, preset-based
    defaults) is more than a few lines.

  For a single small dialog with a flat schema and no reuse (see §11 examples), an inline
  `z.object({...})` + local `type Form = z.infer<...>` at the top of the component file is fine
  — don't force a split file for its own sake.

## 2. Schema & types (zod)

```ts
export const xxxFormSchema = z.object({ ... }).superRefine((data, ctx) => {
  // cross-field / conditional-required checks
  ctx.addIssue({ code: 'custom', path: ['fieldName'], message: '...' })
})
export type XxxFormState = z.infer<typeof xxxFormSchema>
export const xxxFormResolver = zodResolver(xxxFormSchema)
export function createDefaultFormState(): XxxFormState { ... }
```

- Always set `path` on `ctx.addIssue` to the real field name — that's what lets
  `fieldState.error` (see §3) resolve the message on the right field.
- `createDefaultFormState()` doubles as both `useForm({ defaultValues })` and the base state that
  preset-building helpers (§6) start from.

## 3. Field rendering pattern (mandatory for new fields)

Use `Controller` for **every** field, including plain text/number inputs — not just custom
inputs. Do not use `register()` in new forms.

```tsx
<Controller
  name="fieldName"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Label</FieldLabel>
      <Input id={field.name} aria-invalid={fieldState.invalid} {...field} />
      <FieldError errors={[fieldState.error]} />
    </Field>
  )}
/>
```

Rules:
- `Field` / `FieldLabel` / `FieldError` live **inside** the `Controller`'s `render`, never
  outside it reading a top-level `formState.errors` object. Reading `formState.errors.fieldName`
  at the top of the component and threading it down repeats the field name as a string literal
  in 3+ places (Controller `name`, `data-invalid` check, error content) with no compiler check
  that they match — a real source of silently-broken error display.
- `data-invalid` / `aria-invalid` come from that render's `fieldState.invalid`, not from a
  shared `errors` object.
- `id={field.name}` + `FieldLabel htmlFor={field.name}` gives label/input association for free —
  don't invent a separate id.
- `FieldError` takes `errors={[fieldState.error]}` (the array form), not `children`. This is
  what makes §4 (nested errors) possible without a different API.
- When a field is updated from auxiliary UI (a "quick select" button, `FrequentAccounts`, a
  suggestion card), call `field.onChange(...)` directly inside that field's own `render`, not an
  external `setValue(...)` — `field.onChange` behaves like a real user edit (triggers
  validation/dirty tracking); `setValue` needs explicit
  `{ shouldValidate: true, shouldDirty: true }` to match, and it's easy to forget.

## 4. Nested / multi-part field errors

Some fields validate as a compound value where a nested error should surface as part of the same
field's error list (e.g. `Amount` = `{ value, currency }`, where a `.superRefine` issue can land
on `.currency`). Don't special-case this in the render — write a small colocated helper and feed
it into the same `FieldError errors={[...]}` array:

```ts
function amountFieldErrors(error?: { message?: string; currency?: { message?: string } }) {
  return [error, error?.currency].filter((e): e is { message?: string } => Boolean(e?.message))
}
// ...
<FieldError errors={amountFieldErrors(fieldState.error)} />
```

## 5. Custom input components contract

Anything under `components/common/input/` that's meant to be used inside a `Controller` render
must accept, at minimum:

```ts
value?: T
onChange?: (value: T | undefined) => void   // or (value: T[]) for a `mode="multi"` variant
id?: string
'aria-invalid'?: boolean | 'true' | 'false'
disabled?: boolean
placeholder?: string
className?: string
```

This lets it be spread as `{...field}` (or wired individually) plus `id`/`aria-invalid` from the
surrounding `Field`, with no adapter layer in the form component. See `AmountInput`,
`ReferenceInput` (and its `AccountInput`/`TagInput` wrappers), `DateInput` for the pattern. When
adding a new input component, match this signature even if the first caller doesn't use every
prop yet.

## 6. Sheets & Dialogs: open-state store + hydration

`Sheet`/`Dialog` content in this codebase stays **mounted** while closed
(`<Sheet open={open}>`) — it isn't remounted on each open. That has two consequences:

1. **Open state lives in a zustand store**, not component state, with free functions exported
   next to the component so callers don't reach into the store directly:

   ```ts
   const useXxxSheetStore = create<XxxSheetState>((set) => ({
     open: false,
     entityId: undefined,
     openSheet: (entityId) => set({ open: true, entityId }),
     closeSheet: () => set({ open: false }),
   }))
   export function openXxxSheet(entityId?: string) {
     useXxxSheetStore.getState().openSheet(entityId)
   }
   ```

   If the dialog needs no payload beyond the open flag, use `createDialogStore()` from
   `store/common/dialog.ts` instead of hand-rolling this (see `import-data-begin-dialog.tsx`).

2. **Form state must be (re)hydrated from an effect keyed on `open`** (plus entity id/data),
   never from `defaultValues` alone — `defaultValues` only applies once, at first mount, so a
   sheet reopened for a different entity would otherwise keep showing the previous one's data.

   ```ts
   useEffect(() => {
     if (!open) return
     if (entityId) {
       // fetch, then a separate effect keyed on the fetched data calls reset(operationToFormState(data))
     } else {
       reset(createPresetFormState(presetStore, userStore.data?.settings?.operationDefaultCurrency))
     }
   }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
   ```

   Put the two things that vary per-branch — "convert a fetched domain object into form state"
   and "build default form state from presets" — into the sibling `*-form.ts` file as **pure**
   functions that take plain data as parameters (not hooks or store reads). That's what lets the
   exact same hydration logic be reused by a full RHF sheet and by a plain-`useState` sheet alike
   (`operationToFormState`, `createPresetFormState` are used by both `operation-sheet.tsx` and
   `import-data-entry-sheet.tsx`).

- Default to full RHF (`useForm` + `zodResolver` + `reset()`) for the form — it gives
  validation and dirty-tracking for free and fits the `Controller` pattern in §3 directly.
- Fall back to a bare `useState<FormState>` (no RHF, no validation) only when the sheet's actual
  job is picking among several pre-built states with no independent client-side validation of
  its own (e.g. choosing between import suggestions) — see `import-data-entry-sheet.tsx`. Even
  then, reuse the same `*-form.ts` conversion/preset helpers so the two hydration paths can't
  drift apart.

## 7. Type-conditional field groups

When a discriminator field (e.g. `type`) changes which other fields are shown/required:

- Split each variant into its own small component taking `{ control, ...auxData }` props (see
  `ExchangeFields` / `TransferFields` / `ExpenseFields` / `IncomeFields` in
  `operation-sheet.tsx`), and switch between them in JSX based on `watch('type')`.
- Keep the "which account type is valid for which operation type" mapping in one place in the
  `*-form.ts` file (`FROM_ACCOUNT_TYPE` / `TO_ACCOUNT_TYPE`) and reuse it from both the zod
  schema's `superRefine` and the type-transition helper — don't duplicate the mapping.
- A discriminator change is allowed to fully `reset()` the form via a pure `transitType(values,
  newType)` helper. Losing per-field dirty/error state on that transition is **intentional**
  (switching type = "refill from scratch", not an incremental edit) — do not treat it as a bug
  to fix.

## 8. Submit

- `onSubmit(data: FormState)` receives fully-typed, already-validated data. Convert back to wire
  format here — not earlier — e.g. `formatDate(data.date, 'yyyy-MM-dd')`, splitting/merging
  amount fields, `data.description || undefined` for optional strings.
- Call the mutation via `useRequest(...).submit({ body })`.
- After a successful submit: close the sheet/dialog, invoke any caller-supplied
  `onSaved`/`onSuccess` callback, and perform any derived side effects there (e.g.
  `presetStore.registerAccountUsage(...)`).

## 9. Legacy pattern — do not copy into new code

`account-dialog.tsx`, `settings/page.tsx`, `login/page.tsx`, and
`import-data-begin-dialog.tsx` predate this convention and mix `register()` for plain inputs
with `Controller` only for custom inputs, reading a shared `formState: { errors }` at the top of
the component (`data-invalid={errors.x ? 'true' : undefined}`, `<FieldError>{errors.x?.message}</FieldError>`).
Don't use them as a reference for new forms. There's no standing requirement to migrate them
proactively, but if a change to one of them is non-trivial, migrate it to the pattern in this
guide as part of that change rather than extending the old style.
