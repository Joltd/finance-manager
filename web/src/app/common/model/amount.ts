import {Pipe, PipeTransform} from "@angular/core";

const decimals = 4

export class Amount {
  value!: number
  currency!: string
}

export function emptyAmount(currency: string): Amount {
  let amount = new Amount()
  amount.value = 0
  amount.currency = currency
  return amount
}

export function plus(left: Amount, right: Amount): Amount {
  if (left.currency != right.currency) throw Error('Cannot add amounts with different currencies')
  let amount = new Amount()
  amount.value = left.value + right.value
  amount.currency = left.currency
  return amount
}

export function toFractional(amount: Amount): number {
  let text = ''+amount.value
  while (text.length < decimals + 1) {
    text = '0' + text
  }

  text = text.substring(0, text.length - decimals) + '.' + text.substring(text.length - decimals)

  return +text
}

export function fromFractional(value: number): number {
  return +value.toFixed(decimals)
    .replace(',', '')
    .replace('.', '')
}

export function formatAsString(amount: Amount, truncate: boolean = false): string {
  let value = truncate ? Math.trunc(toFractional(amount)) : toFractional(amount)
  return `${value} ${amount.currency}`
}

@Pipe({
  name: 'format'
})
export class AmountPipe implements PipeTransform {

  transform(amount: Amount, truncate: boolean = false): string {
    return formatAsString(amount, truncate)
  }

}
