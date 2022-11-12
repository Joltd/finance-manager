export class Settings {
  currencies: string[] = []
  fastExpense!: FastExpense
}

export interface FastExpense {
  account: string | null
  currency: string | null
}
