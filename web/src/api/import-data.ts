import { buildPath } from '@/lib/api'

export const importDataUrls = {
  root: '/api/v1/import-data',
  id: '/api/v1/import-data/:id',
  entry: '/api/v1/import-data/:id/entry',
  entryById: '/api/v1/import-data/:id/entry/:entryId',
  begin: '/api/v1/import-data/begin',
  commit: '/api/v1/import-data/:id/commit',
}

export const importDataChannels = {
  data: (id: string) => buildPath(importDataUrls.id, { id }),
  entry: (id: string) => buildPath(importDataUrls.entry, { id }),
}
