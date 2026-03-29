# Finance Manager

Personal finance management application.

## Monorepo structure

```
finance-manager/
├── server/   — Kotlin / Spring Boot backend
├── web/      — Next.js frontend
└── files/    — uploaded files volume (runtime)
```

## Modules

Each module has its own CLAUDE.md with stack-specific conventions:
- `web/CLAUDE.md` — Next.js, components, state, layout patterns
- `server/CLAUDE.md` — Kotlin, Spring Boot, domain architecture
