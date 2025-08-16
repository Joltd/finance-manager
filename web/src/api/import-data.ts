export const importDataUrls = {
  root: '/import-data',
  id: '/import-data/:id',
  entry: '/import-data/:id/entry',
  suggestion: '/import-data/:id/entry/:entryId/suggestion',
  account: '/import-data/account',
  operation: '/import-data/operation',
  begin: '/import-data/begin',
  actualBalance: '/import-data/:id/actual-balance',
  entryLink: '/import-data/:id/entry/link',
  entryIdLink: '/import-data/:id/entry/:entryId/link',
  entryUnlink: '/import-data/:id/entry/unlink',
  entryVisibility: '/import-data/:id/entry/visibility',
  entryApprove: '/import-data/:id/entry/:entryId/approve',
}

export const importDataEvents = {
  id: '/import-data/:id',
  entry: '/import-data/:id/entry',
}
