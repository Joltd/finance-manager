import {Pipe, PipeTransform} from "@angular/core";

const decimals = 4

export class Amount {
  value!: number
  currency!: string
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

@Pipe({
  name: 'format'
})
export class AmountPipe implements PipeTransform {

  transform(amount: Amount): string {
    return `${toFractional(amount)} ${amount.currency}`
  }

}
