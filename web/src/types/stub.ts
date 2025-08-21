import { Account, AccountBalance, AccountType } from '@/types/account'
import { Operation, OperationType } from '@/types/operation'
import { amount } from '@/types/common'

export const cashAccount: Account = {
  id: '1',
  name: 'Cash',
  type: AccountType.ACCOUNT,
  deleted: false,
}

export const creditCardAccount: Account = {
  id: '2',
  name: 'Credit Card',
  type: AccountType.ACCOUNT,
  deleted: false,
}

export const bankAccount: Account = {
  id: '5',
  name: 'Bank Account',
  type: AccountType.ACCOUNT,
  deleted: false,
}

//

export const foodExpense: Account = {
  id: '3',
  name: 'Food',
  type: AccountType.EXPENSE,
  deleted: false,
}

export const transportExpense: Account = {
  id: '4',
  name: 'Transport',
  type: AccountType.EXPENSE,
  deleted: false,
}

export const utilityExpense: Account = {
  id: '6',
  name: 'Utilities',
  type: AccountType.EXPENSE,
  deleted: false,
}

export const entertainmentExpense: Account = {
  id: '7',
  name: 'Entertainment',
  type: AccountType.EXPENSE,
  deleted: false,
}

//

export const sales: Account = {
  id: '10',
  name: 'Sales',
  type: AccountType.INCOME,
  deleted: false,
}

export const salary: Account = {
  id: '11',
  name: 'Salary',
  type: AccountType.INCOME,
  deleted: false,
}

export const investments: Account = {
  id: '12',
  name: 'Investments',
  type: AccountType.INCOME,
  deleted: false,
}

//

const operation1: Operation = {
  id: '1',
  date: '2025-03-01',
  type: OperationType.EXPENSE,
  accountFrom: cashAccount,
  amountFrom: amount(100, 'RUB'),
  accountTo: utilityExpense,
  amountTo: amount(100, 'RUB'),
  raw: [],
}

const operation2: Operation = {
  id: '2',
  date: '2025-03-02',
  type: OperationType.EXPENSE,
  accountFrom: cashAccount,
  amountFrom: amount(50, 'RUB'),
  accountTo: foodExpense,
  amountTo: amount(50, 'RUB'),
  raw: [],
}

const operation3: Operation = {
  id: '3',
  date: '2025-03-03',
  type: OperationType.EXPENSE,
  accountFrom: creditCardAccount,
  amountFrom: amount(30, 'RUB'),
  accountTo: transportExpense,
  amountTo: amount(30, 'RUB'),
  raw: [],
}

const operation4: Operation = {
  id: '4',
  date: '2025-03-04',
  type: OperationType.EXPENSE,
  accountFrom: bankAccount,
  amountFrom: amount(200, 'RUB'),
  accountTo: entertainmentExpense,
  amountTo: amount(200, 'RUB'),
  raw: [],
}

const operation5: Operation = {
  id: '5',
  date: '2025-03-05',
  type: OperationType.EXPENSE,
  accountFrom: creditCardAccount,
  amountFrom: amount(150, 'RUB'),
  accountTo: utilityExpense,
  amountTo: amount(150, 'RUB'),
  raw: [],
}

const operation6: Operation = {
  id: '6',
  date: '2025-03-06',
  type: OperationType.EXPENSE,
  accountFrom: bankAccount,
  amountFrom: amount(75, 'RUB'),
  accountTo: foodExpense,
  amountTo: amount(75, 'RUB'),
  raw: [],
}

export const operations: Operation[] = [
  operation1,
  operation2,
  operation3,
  operation4,
  operation5,
  operation6,
]

const balance1: AccountBalance = {
  id: '1',
  name: 'Cash',
  balances: [amount(60000, 'RUB'), amount(2000, 'USD')],
}

const balance2: AccountBalance = {
  id: '2',
  name: 'Credit Card',
  balances: [amount(5000, 'USD'), amount(3000, 'EUR')],
}

const balance3: AccountBalance = {
  id: '3',
  name: 'Bank Account',
  balances: [amount(120000, 'RUB'), amount(4500, 'USD')],
}

export const balances: AccountBalance[] = [balance1, balance2, balance3]
