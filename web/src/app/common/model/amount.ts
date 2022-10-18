import {Pipe, PipeTransform} from "@angular/core";

export class Amount {
  value!: number
  currency!: string

}

@Pipe({
  name: 'format'
})
export class AmountPipe implements PipeTransform {

  transform(amount: Amount): string {
    return `${amount.value / 10000} ${amount.currency}`
  }

}
