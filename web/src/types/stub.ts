import { Account, AccountType } from '@/types/account'
import { Operation, OperationType } from '@/types/operation'
import { ImportData, ImportDataEntryGroup } from '@/types/import-data'
import { Amount } from '@/types/common'
import { EntityPage } from '@/types/entity'

function amount(value: number, currency: string): Amount {
  return { value: value * 10000, currency }
}

// Account definitions
export const cashAccount: Account = {
  id: '1',
  name: 'Cash',
  type: AccountType.ACCOUNT,
}

export const debitCardAccount: Account = {
  id: '2',
  name: 'Debit Card Debit Card Debit Card Debit Card ',
  type: AccountType.ACCOUNT,
}

export const cryptoAccount: Account = {
  id: '3',
  name: 'Crypto Wallet',
  type: AccountType.ACCOUNT,
}

export const storageAccount: Account = {
  id: '4',
  name: 'Hidden Storage',
  type: AccountType.ACCOUNT,
}

export const marketExpense: Account = {
  id: '5',
  name: 'Markets',
  type: AccountType.EXPENSE,
}

export const restaurantExpense: Account = {
  id: '6',
  name: 'Restaurants',
  type: AccountType.EXPENSE,
}

export const transportExpense: Account = {
  id: '7',
  name: 'Transport',
  type: AccountType.EXPENSE,
}

export const utilityExpense: Account = {
  id: '8',
  name: 'Utilities',
  type: AccountType.EXPENSE,
}

export const salaryIncome: Account = {
  id: '9',
  name: 'Salary',
  type: AccountType.INCOME,
}

export const freelanceIncome: Account = {
  id: '10',
  name: 'Freelance',
  type: AccountType.INCOME,
}

export const investmentIncome: Account = {
  id: '11',
  name: 'Investments',
  type: AccountType.INCOME,
}

// Operation definitions

// EXPENSE operations
export const groceryExpense: Operation = {
  id: '101',
  date: '2023-10-15',
  type: OperationType.EXPENSE,
  amountFrom: { value: 85.5 * 10000, currency: 'USD' },
  accountFrom: debitCardAccount,
  amountTo: { value: 85.5 * 10000, currency: 'USD' },
  accountTo: marketExpense,
  description: 'Weekly grocery shopping',
}

export const dinnerExpense: Operation = {
  id: '102',
  date: '2023-10-16',
  type: OperationType.EXPENSE,
  amountFrom: { value: 65.75 * 10000, currency: 'USD' },
  accountFrom: cashAccount,
  amountTo: { value: 65.75 * 10000, currency: 'USD' },
  accountTo: restaurantExpense,
  description: 'Dinner with friends',
}

export const busTicketExpense: Operation = {
  id: '103',
  date: '2023-10-17',
  type: OperationType.EXPENSE,
  amountFrom: { value: 25.0 * 10000, currency: 'USD' },
  accountFrom: debitCardAccount,
  amountTo: { value: 25.0 * 10000, currency: 'USD' },
  accountTo: transportExpense,
  description: 'Monthly bus pass',
}

// INCOME operations
export const monthlySalary: Operation = {
  id: '104',
  date: '2023-10-01',
  type: OperationType.INCOME,
  amountFrom: { value: 3500.0 * 10000, currency: 'USD' },
  accountFrom: salaryIncome,
  amountTo: { value: 3500.0 * 10000, currency: 'USD' },
  accountTo: debitCardAccount,
  description: 'Monthly salary payment',
}

export const freelancePayment: Operation = {
  id: '105',
  date: '2023-10-10',
  type: OperationType.INCOME,
  amountFrom: { value: 750.0 * 10000, currency: 'USD' },
  accountFrom: freelanceIncome,
  amountTo: { value: 750.0 * 10000, currency: 'USD' },
  accountTo: cashAccount,
  description: 'Website development project',
}

export const dividendIncome: Operation = {
  id: '106',
  date: '2023-10-05',
  type: OperationType.INCOME,
  amountFrom: { value: 120.0 * 10000, currency: 'USD' },
  accountFrom: investmentIncome,
  amountTo: { value: 120.0 * 10000, currency: 'USD' },
  accountTo: debitCardAccount,
  description: 'Quarterly dividend payment',
}

// TRANSFER operations
export const bankToWallet: Operation = {
  id: '107',
  date: '2023-10-12',
  type: OperationType.TRANSFER,
  amountFrom: { value: 200.0 * 10000, currency: 'USD' },
  accountFrom: debitCardAccount,
  amountTo: { value: 200.0 * 10000, currency: 'USD' },
  accountTo: cashAccount,
  description: 'ATM withdrawal',
}

export const savingsTransfer: Operation = {
  id: '108',
  date: '2023-10-20',
  type: OperationType.TRANSFER,
  amountFrom: { value: 500.0 * 10000, currency: 'USD' },
  accountFrom: debitCardAccount,
  amountTo: { value: 500.0 * 10000, currency: 'USD' },
  accountTo: storageAccount,
  description: 'Monthly savings',
}

// EXCHANGE operations
export const dollarToEuro: Operation = {
  id: '109',
  date: '2023-10-18',
  type: OperationType.EXCHANGE,
  amountFrom: { value: 300.0 * 10000, currency: 'USD' },
  accountFrom: cashAccount,
  amountTo: { value: 275.0 * 10000, currency: 'EUR' },
  accountTo: cashAccount,
  description: 'Currency exchange for trip',
}

export const cryptoExchange: Operation = {
  id: '110',
  date: '2023-10-22',
  type: OperationType.EXCHANGE,
  amountFrom: { value: 1000.0 * 10000, currency: 'USD' },
  accountFrom: debitCardAccount,
  amountTo: { value: 0.03 * 10000, currency: 'BTC' },
  accountTo: cryptoAccount,
  description: 'Bitcoin investment',
}

export const operations = [
  groceryExpense,
  dinnerExpense,
  busTicketExpense,
  monthlySalary,
  freelancePayment,
  dividendIncome,
  bankToWallet,
  savingsTransfer,
  dollarToEuro,
  cryptoExchange,
]

export const importData: ImportData = {
  id: '1',
  account: cashAccount,
  totals: [
    {
      currency: 'USD',
      operation: { value: 156550 * 10000, currency: 'USD' },
      parsed: { value: 158675 * 10000, currency: 'USD' },
      actual: { value: 160000 * 10000, currency: 'USD' },
    },
    {
      currency: 'BTC',
      operation: { value: 0.04 * 10000, currency: 'BTC' },
      parsed: { value: 0.025 * 10000, currency: 'BTC' },
      // actual: {value: 0.04 * 10000, currency: 'BTC'},
    },
  ],
}

export const importDataEntryPage: EntityPage<ImportDataEntryGroup> = {
  page: 0,
  size: 50,
  records: [
    {
      date: '2025-05-10',
      totals: [
        {
          currency: 'USD',
          operation: { value: 156550 * 10000, currency: 'USD' },
          parsed: { value: 158675 * 10000, currency: 'USD' },
        },
        {
          currency: 'BTC',
          operation: { value: 0.025 * 10000, currency: 'BTC' },
          parsed: { value: 0.025 * 10000, currency: 'BTC' },
        },
      ],
      entries: [
        {
          linked: true,
          operation: {
            id: '1',
            type: OperationType.TRANSFER,
            date: '2025-05-10',
            accountFrom: cashAccount,
            amountFrom: amount(150300, 'USD'),
            accountTo: debitCardAccount,
            amountTo: amount(150300, 'USD'),
          },
          parsed: {
            type: OperationType.TRANSFER,
            date: '2025-05-10',
            accountFrom: cashAccount,
            amountFrom: amount(150300, 'USD'),
            accountTo: debitCardAccount,
            amountTo: amount(150300, 'USD'),
            selected: false,
          },
          suggestions: [],
        },
        {
          linked: true,
          operation: {
            id: '2',
            type: OperationType.EXPENSE,
            date: '2025-05-10',
            accountFrom: debitCardAccount,
            amountFrom: amount(250, 'USD'),
            accountTo: marketExpense,
            amountTo: amount(250, 'USD'),
          },
          parsed: {
            type: OperationType.EXPENSE,
            date: '2025-05-10',
            accountFrom: debitCardAccount,
            amountFrom: amount(250, 'USD'),
            accountTo: marketExpense,
            amountTo: amount(250, 'USD'),
            selected: false,
          },
          suggestions: [],
        },
        {
          // operation: {
          //   id: '3',
          //   type: OperationType.INCOME,
          //   date: '2025-05-10',
          //   accountFrom: salaryIncome,
          //   amountFrom: amount(5000, 'USD'),
          //   accountTo: debitCardAccount,
          //   amountTo: amount(5000, 'USD')
          // },
          parsed: {
            type: OperationType.INCOME,
            date: '2025-05-10',
            accountFrom: salaryIncome,
            amountFrom: amount(5000, 'USD'),
            accountTo: debitCardAccount,
            amountTo: amount(5000, 'USD'),
            selected: false,
          },
          suggestions: [
            {
              type: OperationType.INCOME,
              date: '2025-05-10',
              accountFrom: salaryIncome,
              amountFrom: amount(5000, 'USD'),
              accountTo: debitCardAccount,
              amountTo: amount(5000, 'USD'),
              selected: false,
            },
            {
              type: OperationType.INCOME,
              date: '2025-05-10',
              accountFrom: salaryIncome,
              amountFrom: amount(5000, 'USD'),
              accountTo: debitCardAccount,
              amountTo: amount(5000, 'USD'),
              selected: false,
            },
            {
              type: OperationType.INCOME,
              date: '2025-05-10',
              accountFrom: salaryIncome,
              amountFrom: amount(5000, 'USD'),
              accountTo: debitCardAccount,
              amountTo: amount(5000, 'USD'),
              selected: false,
            },
            {
              type: OperationType.INCOME,
              date: '2025-05-10',
              accountFrom: salaryIncome,
              amountFrom: amount(5000, 'USD'),
              accountTo: debitCardAccount,
              amountTo: amount(5000, 'USD'),
              selected: false,
            },
          ],
        },
        {
          // operation: {
          //   id: '4',
          //   type: OperationType.EXCHANGE,
          //   date: '2025-05-10',
          //   accountFrom: debitCardAccount,
          //   amountFrom: amount(1000, 'USD'),
          //   accountTo: cryptoAccount,
          //   amountTo: amount(0.025, 'BTC')
          // },
          parsed: {
            type: OperationType.EXCHANGE,
            date: '2025-05-10',
            accountFrom: debitCardAccount,
            amountFrom: amount(1000, 'USD'),
            accountTo: cryptoAccount,
            amountTo: amount(0.025, 'BTC'),
            selected: false,
          },
          suggestions: [],
        },
        {
          parsed: {
            type: OperationType.EXPENSE,
            date: '2025-05-10',
            accountFrom: debitCardAccount,
            amountFrom: amount(125, 'USD'),
            accountTo: marketExpense,
            amountTo: amount(125, 'USD'),
            selected: false,
          },
          suggestions: [
            {
              selected: true,
              type: OperationType.EXPENSE,
              date: '2025-05-10',
              accountFrom: debitCardAccount,
              amountFrom: amount(125, 'USD'),
              accountTo: marketExpense,
              amountTo: amount(125, 'USD'),
            },
          ],
        },
        {
          parsed: {
            type: OperationType.INCOME,
            date: '2025-05-10',
            accountFrom: freelanceIncome,
            amountFrom: amount(2000, 'USD'),
            accountTo: debitCardAccount,
            amountTo: amount(2000, 'USD'),
            selected: false,
          },
          suggestions: [
            {
              selected: true,
              type: OperationType.INCOME,
              date: '2025-05-10',
              accountFrom: freelanceIncome,
              amountFrom: amount(2000, 'USD'),
              accountTo: debitCardAccount,
              amountTo: amount(2000, 'USD'),
            },
          ],
        },
      ],
    },
    {
      date: '2025-05-11',
      totals: [
        {
          currency: 'USD',
          operation: { value: 515 * 10000, currency: 'USD' },
        },
      ],
      entries: [
        {
          operation: {
            id: '6',
            type: OperationType.EXPENSE,
            date: '2025-05-11',
            accountFrom: debitCardAccount,
            amountFrom: amount(120, 'USD'),
            accountTo: transportExpense,
            amountTo: amount(120, 'USD'),
          },
          suggestions: [],
        },
        {
          operation: {
            id: '11',
            type: OperationType.INCOME,
            date: '2025-05-11',
            accountFrom: investmentIncome,
            amountFrom: amount(350, 'USD'),
            accountTo: debitCardAccount,
            amountTo: amount(350, 'USD'),
          },
          suggestions: [],
        },
        {
          operation: {
            id: '12',
            type: OperationType.EXPENSE,
            date: '2025-05-11',
            accountFrom: cashAccount,
            amountFrom: amount(45, 'USD'),
            accountTo: restaurantExpense,
            amountTo: amount(45, 'USD'),
          },
          suggestions: [],
        },
      ],
    },
    {
      date: '2025-05-12',
      totals: [
        {
          currency: 'USD',
          operation: { value: 1350 * 10000, currency: 'USD' },
          parsed: { value: 200 * 10000, currency: 'USD' },
        },
        {
          currency: 'EUR',
          operation: { value: 180 * 10000, currency: 'EUR' },
          parsed: { value: 180 * 10000, currency: 'EUR' },
        },
      ],
      entries: [
        {
          operation: {
            id: '7',
            type: OperationType.TRANSFER,
            date: '2025-05-12',
            accountFrom: debitCardAccount,
            amountFrom: amount(1000, 'USD'),
            accountTo: storageAccount,
            amountTo: amount(1000, 'USD'),
          },
          suggestions: [],
        },
        {
          operation: {
            id: '13',
            type: OperationType.EXPENSE,
            date: '2025-05-12',
            accountFrom: debitCardAccount,
            amountFrom: amount(150, 'USD'),
            accountTo: utilityExpense,
            amountTo: amount(150, 'USD'),
          },
          suggestions: [],
        },
        {
          operation: {
            id: '14',
            type: OperationType.EXCHANGE,
            date: '2025-05-12',
            accountFrom: debitCardAccount,
            amountFrom: amount(200, 'USD'),
            accountTo: cashAccount,
            amountTo: amount(180, 'EUR'),
          },
          parsed: {
            type: OperationType.EXCHANGE,
            date: '2025-05-12',
            accountFrom: debitCardAccount,
            amountFrom: amount(200, 'USD'),
            accountTo: cashAccount,
            amountTo: amount(180, 'EUR'),
            selected: false,
          },
          suggestions: [],
        },
      ],
    },
    {
      date: '2025-05-13',
      totals: [
        {
          currency: 'USD',
          operation: { value: 3300 * 10000, currency: 'USD' },
        },
      ],
      entries: [
        {
          operation: {
            id: '8',
            type: OperationType.INCOME,
            date: '2025-05-13',
            accountFrom: freelanceIncome,
            amountFrom: amount(2500, 'USD'),
            accountTo: debitCardAccount,
            amountTo: amount(2500, 'USD'),
          },
          suggestions: [],
        },
        {
          operation: {
            id: '15',
            type: OperationType.EXPENSE,
            date: '2025-05-13',
            accountFrom: debitCardAccount,
            amountFrom: amount(300, 'USD'),
            accountTo: marketExpense,
            amountTo: amount(300, 'USD'),
          },
          suggestions: [],
        },
        {
          operation: {
            id: '16',
            type: OperationType.TRANSFER,
            date: '2025-05-13',
            accountFrom: cashAccount,
            amountFrom: amount(500, 'USD'),
            accountTo: cryptoAccount,
            amountTo: amount(500, 'USD'),
          },
          suggestions: [],
        },
      ],
    },
    {
      date: '2025-05-14',
      totals: [
        {
          currency: 'USD',
          operation: { value: 2080 * 10000, currency: 'USD' },
        },
        {
          currency: 'BTC',
          operation: { value: 0.015 * 10000, currency: 'BTC' },
        },
      ],
      entries: [
        {
          operation: {
            id: '9',
            type: OperationType.EXCHANGE,
            date: '2025-05-14',
            accountFrom: debitCardAccount,
            amountFrom: amount(500, 'USD'),
            accountTo: cryptoAccount,
            amountTo: amount(0.015, 'BTC'),
          },
          suggestions: [],
        },
        {
          operation: {
            id: '17',
            type: OperationType.INCOME,
            date: '2025-05-14',
            accountFrom: salaryIncome,
            amountFrom: amount(1500, 'USD'),
            accountTo: debitCardAccount,
            amountTo: amount(1500, 'USD'),
          },
          suggestions: [],
        },
        {
          operation: {
            id: '18',
            type: OperationType.EXPENSE,
            date: '2025-05-14',
            accountFrom: debitCardAccount,
            amountFrom: amount(80, 'USD'),
            accountTo: transportExpense,
            amountTo: amount(80, 'USD'),
          },
          suggestions: [],
        },
      ],
    },
    {
      date: '2025-05-15',
      totals: [
        {
          currency: 'USD',
          operation: { value: 555 * 10000, currency: 'USD' },
        },
      ],
      entries: [
        {
          operation: {
            id: '10',
            type: OperationType.EXPENSE,
            date: '2025-05-15',
            accountFrom: debitCardAccount,
            amountFrom: amount(200, 'USD'),
            accountTo: utilityExpense,
            amountTo: amount(200, 'USD'),
          },
          suggestions: [],
        },
        {
          operation: {
            id: '19',
            type: OperationType.TRANSFER,
            date: '2025-05-15',
            accountFrom: debitCardAccount,
            amountFrom: amount(300, 'USD'),
            accountTo: cashAccount,
            amountTo: amount(300, 'USD'),
          },
          suggestions: [],
        },
        {
          operation: {
            id: '20',
            type: OperationType.EXPENSE,
            date: '2025-05-15',
            accountFrom: cashAccount,
            amountFrom: amount(55, 'USD'),
            accountTo: restaurantExpense,
            amountTo: amount(55, 'USD'),
          },
          suggestions: [],
        },
      ],
    },
  ],
  total: 20,
}
