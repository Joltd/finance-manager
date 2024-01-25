import { Component, OnInit, ViewChild } from "@angular/core";
import { TaxService } from "../../service/tax.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { Income } from "../../model/taxes";
import { ExchangeRateService } from "../../../exchangerate/service/exchange-rate.service";
import { Amount, emptyAmount, fromFractional, plus, toFractional } from "../../../common/model/amount";
import { lastValueFrom } from "rxjs";
import { Operation } from "../../../operation/model/operation";
import { SelectionModel } from "@angular/cdk/collections";
import { MatListOption, MatSelectionList } from "@angular/material/list";
import { StepperSelectionEvent } from "@angular/cdk/stepper";

@Component({
  selector: "new-tax",
  templateUrl: "./new-tax.component.html",
  styleUrls: ["./new-tax.component.scss"]
})
export class NewTaxComponent implements OnInit {

  form = new FormGroup({
    date: new FormControl(moment().startOf('month').subtract(3, 'month').format('yyyy-MM-DD'), Validators.required),
    currency: new FormControl('GEL', Validators.required),
    amount: new FormControl(null, Validators.required),
  })

  @ViewChild(MatSelectionList)
  selection!: MatSelectionList

  operations: Operation[] = []
  incomes: Income[] = []

  monthTax: Amount = emptyAmount('USD')
  yearTax: Amount = emptyAmount('USD')

  constructor(
    private taxesService: TaxService,
    private exchangeRateService: ExchangeRateService,
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
    this.taxesService.listIncomes(date)
      .subscribe(result => this.operations = result)
    this.taxesService.yearTax(date, currency)
      .subscribe(result => {
        this.monthTax = emptyAmount(currency)
        this.yearTax = result
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
    this.monthTax = this.incomes.map(income => income.amount)
      .reduce((acc, amount) => plus(acc, amount), emptyAmount(this.form.value.currency!!))
    this.form.patchValue({amount: this.monthTax as any})
  }

  totalTaxes(): Amount {
    return plus(this.monthTax, this.yearTax)
  }

  save() {

  }

}
