export interface FilterPreset {
  id?: string
  presetKey: string
  name: string
  filter: Record<string, unknown>
}
