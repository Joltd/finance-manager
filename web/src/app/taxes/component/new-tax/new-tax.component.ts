import { Component, OnInit, ViewChild } from "@angular/core";
import { TaxService } from "../../service/tax.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { Income } from "../../model/taxes";
import { ExchangeRateService } from "../../../exchangerate/service/exchange-rate.service";
import { Amount, emptyAmount, fromFractional, plus, toFractional } from "../../../common/model/amount";
import { lastValueFrom } from "rxjs";
import { Operation } from "../../../operation/model/operation";
import { MatSelectionList } from "@angular/material/list";
import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { ShortMessageService } from "../../../common/service/short-message.service";
import { Router } from "@angular/router";

@Component({
  selector: "new-tax",
  templateUrl: "./new-tax.component.html",
  styleUrls: ["./new-tax.component.scss"]
})
export class NewTaxComponent implements OnInit {

  form = new FormGroup({
    date: new FormControl(moment().startOf('month').format('yyyy-MM-DD'), Validators.required),
    currency: new FormControl(null, Validators.required),
    interestRate: new FormControl(null, Validators.required),
    base: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
  })

  @ViewChild(MatSelectionList)
  selection!: MatSelectionList

  operations: Operation[] = []
  incomes: Income[] = []

  monthTotal: Amount = emptyAmount('USD')
  yearTotal: Amount = emptyAmount('USD')
  taxAmount: Amount = emptyAmount('USD')

  constructor(
    private taxService: TaxService,
    private exchangeRateService: ExchangeRateService,
    private shortMessageService: ShortMessageService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  nextStep(event: StepperSelectionEvent) {
    let prev = event.previouslySelectedIndex
    let next = event.selectedIndex
    if (prev == 0 && next == 1) {
      this.loadIncomes()
    } else if (prev == 1 && next == 2) {
      this.calcTaxes()
    }
  }

  private loadIncomes() {
    let date = moment(this.form.value.date!!).startOf('month').format('yyyy-MM-DD')
    let currency = this.form.value.currency!!;
    this.taxService.listIncomes(date)
      .subscribe(result => this.operations = result)
    this.taxService.yearTotal(date, currency)
      .subscribe(result => {
        this.yearTotal = result
        this.monthTotal = emptyAmount(currency)
        this.taxAmount = emptyAmount(currency)
      })
  }

  calcTaxes() {
    this.incomes = this.selection.selectedOptions
      .selected
      .map(option => {
        return {
          operation: option.value as Operation,
          amount: {
            currency: this.form.value.currency!!,
            value: 0,
          }
        } as Income
      })
    this.calcIncomeInSelectedCurrency().then()
  }

  private async calcIncomeInSelectedCurrency() {
    for (let income of this.incomes) {
      let date = income.operation.date
      let amount = income.operation.amountTo
      let from = amount.currency
      let to = this.form.value.currency!!
      let rate = await lastValueFrom(this.exchangeRateService.rate(date, from, to))
      income.amount.value = fromFractional(toFractional(amount) * rate)
    }
    this.monthTotal = this.incomes.map(income => income.amount)
      .reduce((acc, amount) => plus(acc, amount), emptyAmount(this.form.value.currency!!))
    let interestRate = this.form.value.interestRate!! / 100
    this.taxAmount = {
      currency: this.form.value.currency!!,
      value: fromFractional(toFractional(this.monthTotal) * interestRate)
    }
    this.form.patchValue({
      base: this.monthTotal as any,
      amount: this.taxAmount as any
    })
  }

  totalAmount(): Amount {
    return plus(this.monthTotal, this.yearTotal)
  }

  save() {
    let tax = {
      date: this.form.value.date,
      base: this.form.value.base,
      rate: this.form.value.interestRate,
      amount: this.form.value.amount,
    }
    this.taxService.save(tax)
      .subscribe(() => {
        this.shortMessageService.show('Done')
        this.router.navigate(['/dashboard']).then()
      })
  }

}
