import { Component, OnInit } from "@angular/core";
import { TaxesService } from "../../service/taxes.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { Income } from "../../model/taxes";
import { ExchangeRateService } from "../../../exchangerate/service/exchange-rate.service";
import { Amount, emptyAmount, plus } from "../../../common/model/amount";
import { lastValueFrom } from "rxjs";

@Component({
  selector: "new-tax",
  templateUrl: "./new-tax.component.html",
  styleUrls: ["./new-tax.component.scss"]
})
export class NewTaxComponent implements OnInit {

  form = new FormGroup({
    date: new FormControl(moment().startOf('month').format('yyyy-MM-DD'), Validators.required),
    currency: new FormControl(null, Validators.required),
  })

  incomes: Income[] = []
  currentTax!: Amount
  yearTax!: Amount

  constructor(
    private taxesService: TaxesService,
    private exchangeRateService: ExchangeRateService,
  ) {}

  ngOnInit(): void {
    this.form.valueChanges.subscribe((v) => {
      console.log(v)
      // date -> this.loadYearTax() this.loadIncomes()
      // currency -> this.loadYearTax() this.calculateAllTaxes()
    })
    this.loadIncomes().then()
    this.loadYearTax()
  }

  incomeSelected(income: Income, event: any) {
    console.log(event)
    // income.selected = ???
    let currency = this.form.value.currency as string | null
    if (!currency) {
      income.amount = null
      return
    }
    if (event == 'true') {
      this.calculateTax(income, currency).then()
    } else {
      income.amount = null
    }
  }

  totalTax(): Amount {
    return plus(this.currentTax, this.yearTax)
  }

  private async loadIncomes() {
    let date = this.form.value.date ?? moment().format('yyyy-MM-DD')
    let incomes = await lastValueFrom(this.taxesService.listIncomes(date))
    this.incomes = incomes.map(income => {
      return {
        selected: false,
        operation: income,
        amount: null,
      }
    })
    await this.calculateTaxes()
  }

  private async loadYearTax() {
    let date = this.form.value.date
    let currency = this.form.value.currency
    if (!date || !currency) {
      return
    }
    this.yearTax = await lastValueFrom(this.taxesService.yearTax(date, currency))
  }

  private async calculateTaxes() {
    let currency = this.form.value.currency
    if (!currency) {
      return
    }

    for (let income of this.incomes) {
      if (!income.selected || !currency) {
        income.amount = null
      } else {
        await this.calculateTax(income, currency)
      }
    }

    this.currentTax = this.incomes.filter(income => income.amount != null)
      .map(income => income.amount!!)
      .reduce((acc, amount) => plus(acc, amount), emptyAmount(currency))
  }

  private async calculateTax(income: Income, currency: string) {
    let rate = await lastValueFrom(this.exchangeRateService.rate(income.operation.amountTo.currency, currency))

    income.amount = {
      currency: currency,
      value: income.operation.amountTo.value * rate,
    }
  }

}
