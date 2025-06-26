import { Account, AccountType } from "@/types/account";
import { Operation, OperationType } from "@/types/operation";
import { ImportDataEntry, ImportDataParsedEntry } from "@/types/import-data";
import { Amount } from "@/types/common";

// Account definitions
export const cashAccount: Account = {
  id: '1',
  name: 'Cash',
  type: AccountType.ACCOUNT
}

export const debitCardAccount: Account = {
  id: '2',
  name: 'Debit Card Debit Card Debit Card Debit Card ',
  type: AccountType.ACCOUNT
}

export const cryptoAccount: Account = {
  id: '3',
  name: 'Crypto Wallet',
  type: AccountType.ACCOUNT
}

export const storageAccount: Account = {
  id: '4',
  name: 'Hidden Storage',
  type: AccountType.ACCOUNT
}

export const marketExpense: Account = {
  id: '5',
  name: 'Markets',
  type: AccountType.EXPENSE
}

export const restaurantExpense: Account = {
  id: '6',
  name: 'Restaurants',
  type: AccountType.EXPENSE
}

export const transportExpense: Account = {
  id: '7',
  name: 'Transport',
  type: AccountType.EXPENSE
}

export const utilityExpense: Account = {
  id: '8',
  name: 'Utilities',
  type: AccountType.EXPENSE
}

export const salaryIncome: Account = {
  id: '9',
  name: 'Salary',
  type: AccountType.INCOME
}

export const freelanceIncome: Account = {
  id: '10',
  name: 'Freelance',
  type: AccountType.INCOME
}

export const investmentIncome: Account = {
  id: '11',
  name: 'Investments',
  type: AccountType.INCOME
}

// Operation definitions

// EXPENSE operations
export const groceryExpense: Operation = {
  id: '101',
  date: '2023-10-15',
  type: OperationType.EXPENSE,
  amountFrom: { value: 85.50 * 10000, currency: 'USD' },
  accountFrom: debitCardAccount,
  amountTo: { value: 85.50 * 10000, currency: 'USD' },
  accountTo: marketExpense,
  description: 'Weekly grocery shopping'
}

export const dinnerExpense: Operation = {
  id: '102',
  date: '2023-10-16',
  type: OperationType.EXPENSE,
  amountFrom: { value: 65.75 * 10000, currency: 'USD' },
  accountFrom: cashAccount,
  amountTo: { value: 65.75 * 10000, currency: 'USD' },
  accountTo: restaurantExpense,
  description: 'Dinner with friends'
}

export const busTicketExpense: Operation = {
  id: '103',
  date: '2023-10-17',
  type: OperationType.EXPENSE,
  amountFrom: { value: 25.00 * 10000, currency: 'USD' },
  accountFrom: debitCardAccount,
  amountTo: { value: 25.00 * 10000, currency: 'USD' },
  accountTo: transportExpense,
  description: 'Monthly bus pass'
}

// INCOME operations
export const monthlySalary: Operation = {
  id: '104',
  date: '2023-10-01',
  type: OperationType.INCOME,
  amountFrom: { value: 3500.00 * 10000, currency: 'USD' },
  accountFrom: salaryIncome,
  amountTo: { value: 3500.00 * 10000, currency: 'USD' },
  accountTo: debitCardAccount,
  description: 'Monthly salary payment'
}

export const freelancePayment: Operation = {
  id: '105',
  date: '2023-10-10',
  type: OperationType.INCOME,
  amountFrom: { value: 750.00 * 10000, currency: 'USD' },
  accountFrom: freelanceIncome,
  amountTo: { value: 750.00 * 10000, currency: 'USD' },
  accountTo: cashAccount,
  description: 'Website development project'
}

export const dividendIncome: Operation = {
  id: '106',
  date: '2023-10-05',
  type: OperationType.INCOME,
  amountFrom: { value: 120.00 * 10000, currency: 'USD' },
  accountFrom: investmentIncome,
  amountTo: { value: 120.00 * 10000, currency: 'USD' },
  accountTo: debitCardAccount,
  description: 'Quarterly dividend payment'
}

// TRANSFER operations
export const bankToWallet: Operation = {
  id: '107',
  date: '2023-10-12',
  type: OperationType.TRANSFER,
  amountFrom: { value: 200.00 * 10000, currency: 'USD' },
  accountFrom: debitCardAccount,
  amountTo: { value: 200.00 * 10000, currency: 'USD' },
  accountTo: cashAccount,
  description: 'ATM withdrawal'
}

export const savingsTransfer: Operation = {
  id: '108',
  date: '2023-10-20',
  type: OperationType.TRANSFER,
  amountFrom: { value: 500.00 * 10000, currency: 'USD' },
  accountFrom: debitCardAccount,
  amountTo: { value: 500.00 * 10000, currency: 'USD' },
  accountTo: storageAccount,
  description: 'Monthly savings'
}

// EXCHANGE operations
export const dollarToEuro: Operation = {
  id: '109',
  date: '2023-10-18',
  type: OperationType.EXCHANGE,
  amountFrom: { value: 300.00 * 10000, currency: 'USD' },
  accountFrom: cashAccount,
  amountTo: { value: 275.00 * 10000, currency: 'EUR' },
  accountTo: cashAccount,
  description: 'Currency exchange for trip'
}

export const cryptoExchange: Operation = {
  id: '110',
  date: '2023-10-22',
  type: OperationType.EXCHANGE,
  amountFrom: { value: 1000.00 * 10000, currency: 'USD' },
  accountFrom: debitCardAccount,
  amountTo: { value: 0.03 * 10000, currency: 'BTC' },
  accountTo: cryptoAccount,
  description: 'Bitcoin investment'
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
  cryptoExchange
]

// ImportDataEntry definitions
export const import1: ImportDataEntry = {
  id: '201',
  issues: [],
  raw: 'DEBIT CARD PURCHASE - GROCERY STORE - $85.50',
  hidden: true
}

export const import2: ImportDataEntry = {
  id: '202',
  issues: [
    'Unable to parse data',
  ],
  raw: 'DEBIT CARD PURCHASE - GROCERY STORE - $85.50',
  hidden: false
}

export const import3: ImportDataEntry = {
  id: '203',
  issues: [
    'Some trouble with interpretation'
  ],
  raw: 'CASH PAYMENT - RESTAURANT - $65.75',
  parsed: {
    raw: ['CASH PAYMENT - RESTAURANT - $65.75'],
    date: '2023-10-16',
    type: OperationType.EXPENSE,
    amountFrom: { value: 650123.75 * 10000, currency: 'USD' },
    accountFrom: cashAccount,
    amountTo: { value: 650123.75 * 10000, currency: 'USD' },
    accountTo: restaurantExpense,
    description: 'Dinner with friends'
  },
  hidden: true
}

export const import4: ImportDataEntry = {
  id: '204',
  issues: [],
  parsed: {
    raw: [
      'Exchange -65 USD',
      'Exchange, +130 GEL',
    ],
    date: '2023-10-16',
    type: OperationType.EXCHANGE,
    amountFrom: { value: 65.75 * 10000, currency: 'USD' },
    accountFrom: debitCardAccount,
    amountTo: { value: 130 * 10000, currency: 'GEL' },
    accountTo: debitCardAccount,
    description: 'Exchange amount'
  },
  hidden: false
}

export const import5: ImportDataEntry = {
  id: '205',
  issues: [],
  raw: 'CASH PAYMENT - RESTAURANT - $65.75',
  parsed: {
    raw: ['CASH PAYMENT - RESTAURANT - $65.75'],
    date: '2023-10-16',
    type: OperationType.EXPENSE,
    amountFrom: { value: 65.75 * 10000, currency: 'USD' },
    accountFrom: cashAccount,
    amountTo: { value: 65.75 * 10000, currency: 'USD' },
    accountTo: restaurantExpense,
    description: 'Dinner with friends'
  },
  suggested: {
    date: '2023-10-16',
    type: OperationType.EXPENSE,
    amountFrom: { value: 65.75 * 10000, currency: 'USD' },
    accountFrom: cashAccount,
    amountTo: { value: 65.75 * 10000, currency: 'USD' },
    accountTo: restaurantExpense,
    description: 'Dinner with friends'
  },
  persisted: undefined,
  hidden: false
}

export const import6: ImportDataEntry = {
  id: '206',
  issues: [],
  raw: 'DEBIT CARD PURCHASE - TRANSPORT COMPANY - $25.00',
  parsed: {
    raw: ['DEBIT CARD PURCHASE - TRANSPORT COMPANY - $25.00'],
    date: '2023-10-17',
    type: OperationType.EXPENSE,
    amountFrom: { value: 25.00 * 10000, currency: 'USD' },
    accountFrom: debitCardAccount,
    amountTo: { value: 25.00 * 10000, currency: 'USD' },
    accountTo: transportExpense,
    description: 'Monthly bus pass'
  },
  suggested: {
    date: '2023-10-17',
    type: OperationType.EXPENSE,
    amountFrom: { value: 25.00 * 10000, currency: 'USD' },
    accountFrom: debitCardAccount,
    amountTo: { value: 25.00 * 10000, currency: 'USD' },
    accountTo: transportExpense,
    description: 'Monthly bus pass'
  },
  persisted: '156',
  hidden: false
}

export const import7: ImportDataEntry = {
  id: '207',
  issues: [],
  raw: 'DIRECT DEPOSIT - EMPLOYER INC - $3500.00',
  parsed: {
    raw: ['DIRECT DEPOSIT - EMPLOYER INC - $3500.00'],
    date: '2023-10-01',
    type: OperationType.INCOME,
    amountFrom: { value: 3500.00 * 10000, currency: 'USD' },
    accountFrom: salaryIncome,
    amountTo: { value: 3500.00 * 10000, currency: 'USD' },
    accountTo: debitCardAccount,
    description: 'Monthly salary payment'
  },
  suggested: {
    date: '2023-10-01',
    type: OperationType.INCOME,
    amountFrom: { value: 3500.00 * 10000, currency: 'USD' },
    accountFrom: salaryIncome,
    amountTo: { value: 3500.00 * 10000, currency: 'USD' },
    accountTo: debitCardAccount,
    description: 'Monthly salary payment'
  },
  persisted: undefined,
  hidden: false
}

export const import8: ImportDataEntry = {
  id: '208',
  issues: [],
  raw: 'PAYMENT RECEIVED - CLIENT XYZ - $750.00',
  parsed: {
    raw: ['PAYMENT RECEIVED - CLIENT XYZ - $750.00'],
    date: '2023-10-10',
    type: OperationType.INCOME,
    amountFrom: { value: 750.00 * 10000, currency: 'USD' },
    accountFrom: freelanceIncome,
    amountTo: { value: 750.00 * 10000, currency: 'USD' },
    accountTo: cashAccount,
    description: 'Website development project'
  },
  suggested: {
    date: '2023-10-10',
    type: OperationType.INCOME,
    amountFrom: { value: 750.00 * 10000, currency: 'USD' },
    accountFrom: freelanceIncome,
    amountTo: { value: 750.00 * 10000, currency: 'USD' },
    accountTo: cashAccount,
    description: 'Website development project'
  },
  persisted: '208',
  hidden: false
}

export const import9: ImportDataEntry = {
  id: '209',
  issues: [],
  raw: 'UTILITY PAYMENT - ELECTRIC COMPANY - $120.35',
  parsed: {
    raw: ['UTILITY PAYMENT - ELECTRIC COMPANY - $120.35'],
    date: '2023-10-25',
    type: OperationType.EXPENSE,
    amountFrom: { value: 120.35 * 10000, currency: 'USD' },
    accountFrom: debitCardAccount,
    amountTo: { value: 120.35 * 10000, currency: 'USD' },
    accountTo: utilityExpense,
    description: 'Monthly electricity bill'
  },
  suggested: {
    date: '2023-10-25',
    type: OperationType.EXPENSE,
    amountFrom: { value: 120.35 * 10000, currency: 'USD' },
    accountFrom: debitCardAccount,
    amountTo: { value: 120.35 * 10000, currency: 'USD' },
    accountTo: utilityExpense,
    description: 'Monthly electricity bill'
  },
  persisted: undefined,
  hidden: false
}

export const import10: ImportDataEntry = {
  id: '210',
  issues: ['Ambiguous merchant category'],
  raw: 'ONLINE PURCHASE - AMAZON.COM - $89.99',
  parsed: {
    raw: ['ONLINE PURCHASE - AMAZON.COM - $89.99'],
    date: '2023-10-28',
    type: OperationType.EXPENSE,
    amountFrom: { value: 89.99 * 10000, currency: 'USD' },
    accountFrom: debitCardAccount,
    amountTo: { value: 89.99 * 10000, currency: 'USD' },
    accountTo: marketExpense,
    description: 'Online shopping'
  },
  suggested: {
    date: '2023-10-28',
    type: OperationType.EXPENSE,
    amountFrom: { value: 89.99 * 10000, currency: 'USD' },
    accountFrom: debitCardAccount,
    amountTo: { value: 89.99 * 10000, currency: 'USD' },
    accountTo: marketExpense,
    description: 'Online shopping'
  },
  persisted: '210',
  hidden: false
}

export const import11: ImportDataEntry = {
  id: '211',
  issues: [],
  raw: 'ATM WITHDRAWAL - BANK OF AMERICA - $200.00',
  parsed: {
    raw: ['ATM WITHDRAWAL - BANK OF AMERICA - $200.00'],
    date: '2023-10-30',
    type: OperationType.TRANSFER,
    amountFrom: { value: 200.00 * 10000, currency: 'USD' },
    accountFrom: debitCardAccount,
    amountTo: { value: 200.00 * 10000, currency: 'USD' },
    accountTo: cashAccount,
    description: 'Cash withdrawal from ATM'
  },
  suggested: {
    date: '2023-10-30',
    type: OperationType.TRANSFER,
    amountFrom: { value: 200.00 * 10000, currency: 'USD' },
    accountFrom: debitCardAccount,
    amountTo: { value: 200.00 * 10000, currency: 'USD' },
    accountTo: cashAccount,
    description: 'Cash withdrawal from ATM'
  },
  persisted: undefined,
  hidden: false
}

export const import12: ImportDataEntry = {
  id: '212',
  issues: [],
  raw: 'DIVIDEND PAYMENT - INVESTMENT FUND - $135.50',
  parsed: {
    raw: ['DIVIDEND PAYMENT - INVESTMENT FUND - $135.50'],
    date: '2023-11-05',
    type: OperationType.INCOME,
    amountFrom: { value: 135.50 * 10000, currency: 'USD' },
    accountFrom: investmentIncome,
    amountTo: { value: 135.50 * 10000, currency: 'USD' },
    accountTo: debitCardAccount,
    description: 'Quarterly dividend from investments'
  },
  suggested: {
    date: '2023-11-05',
    type: OperationType.INCOME,
    amountFrom: { value: 135.50 * 10000, currency: 'USD' },
    accountFrom: investmentIncome,
    amountTo: { value: 135.50 * 10000, currency: 'USD' },
    accountTo: debitCardAccount,
    description: 'Quarterly dividend from investments'
  },
  persisted: '212',
  hidden: true
}

export const import13: ImportDataEntry = {
  id: '213',
  issues: ['Currency conversion rate may be inaccurate'],
  raw: 'CURRENCY EXCHANGE - USD TO EUR - $350.00',
  parsed: {
    raw: ['CURRENCY EXCHANGE - USD TO EUR - $350.00'],
    date: '2023-11-10',
    type: OperationType.EXCHANGE,
    amountFrom: { value: 350123123.00 * 10000, currency: 'USD' },
    accountFrom: debitCardAccount,
    amountTo: { value: 320123123.00 * 10000, currency: 'EUR' },
    accountTo: debitCardAccount,
    description: 'Currency exchange for international travel'
  },
  suggested: {
    date: '2023-11-10',
    type: OperationType.EXCHANGE,
    amountFrom: { value: 350123123.00 * 10000, currency: 'USD' },
    accountFrom: debitCardAccount,
    amountTo: { value: 32012313.00 * 10000, currency: 'EUR' },
    accountTo: debitCardAccount,
    description: 'Currency exchange for international travel'
  },
  persisted: undefined,
  hidden: true
}

export const imports = [
  import1,
  import2,
  import3,
  import4,
  import5,
  import6,
  import7,
  import8,
  import9,
  import10,
  import11,
  import12,
  import13
]