export class CategoryMappingPage {
  total!: number
  page!: number
  size!: number
  mappings: CategoryMapping[] = []
}

export class CategoryMapping {
  id!: string
  parser!: string
  pattern!: string
  categoryType!: 'EXPENSE' | 'INCOME'
  category!: string
  categoryName!: string
}

