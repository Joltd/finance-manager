export class DocumentRow {
  type!: 'expense' | 'income' | 'exchange'
  id!: string
  date!: string
  description!: string
}
