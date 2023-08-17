export class CategoryMappingPage {
  total!: number
  page!: number
  size!: number
  mappings: CategoryMapping[] = []
}

export class CategoryMapping {
  id!: string
  parser!: string
  parserName!: string
  pattern!: string
  categoryType!: 'expense' | 'income'
  category!: string
  categoryName!: string
}

