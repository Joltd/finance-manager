import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { CandyService } from "../../service/candy.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { Amount } from "../../../common/model/amount";
import { ExchangeRateService } from "../../../exchangerate/service/exchange-rate.service";

@Component({
  selector: 'candy-expense',
  templateUrl: './candy-expense.component.html',
  styleUrls: ['./candy-expense.component.scss']
})
export class CandyExpenseComponent {

  form: FormGroup = new FormGroup({
    date: new FormControl(moment().format('yyyy-MM-DD'), [Validators.required]),
    amount: new FormControl(null, [Validators.required]),
    comment: new FormControl(null, [Validators.required])
  })
  amountUsd: Amount = {
    currency: 'USD',
    value: 0
  }

  constructor(
    private dialogRef: MatDialogRef<CandyExpenseComponent>,
    private candyService: CandyService,
    private exchangeRateService: ExchangeRateService
  ) {}

  isInvalid(): boolean {
    return this.form.invalid
  }

  amountChanged() {
    let amount = this.form.value.amount
    if (amount) {
      this.exchangeRateService.rate(amount.currency, 'USD')
        .subscribe(result => {
          this.amountUsd = {
            value: amount.value * result,
            currency: 'USD'
          }
        })
    }
  }

  save() {
    this.candyService.expense(this.form.value)
      .subscribe(() => this.dialogRef.close())
  }

  close() {
    this.dialogRef.close()
  }

}
