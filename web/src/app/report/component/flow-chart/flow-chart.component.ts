import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {FlowChartService} from "../../service/flow-chart.service";
import {FormControl, FormGroup} from "@angular/forms";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {Amount, emptyAmount, formatAsString, plus, toFractional} from "../../../common/model/amount";
import {ReferenceService} from "../../../common/service/reference.service";
import {Reference} from "../../../common/model/reference";
import * as moment from "moment";
import {FlowChart, FlowChartEntry} from "../../model/flow-chart";
import {MatExpansionPanel} from "@angular/material/expansion";
import {DocumentService} from "../../../document/service/document.service";
import {Router} from "@angular/router";

@Component({
  selector: 'flow-chart',
  templateUrl: 'flow-chart.component.html',
  styleUrls: ['flow-chart.component.scss']
})
export class FlowChartComponent implements AfterViewInit, OnDestroy {

  @ViewChild('filter')
  filter!: MatExpansionPanel

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts
  chartHeight: number = 0

  accounts: Map<string,Reference> = new Map<string,Reference>()
  categories: Map<string,Reference> = new Map<string,Reference>()
  expenseCategories: Reference[] = []
  incomeCategories: Reference[] = []

  settings: FormGroup = new FormGroup({
    dateFrom: new FormControl(moment().subtract(3, 'month').format('yyyy-MM-DD')),
    dateTo: new FormControl(moment().format('yyyy-MM-DD')),
    type: new FormControl(null),
    categories: new FormControl([]),
    commonCurrency: new FormControl('USD')
  })
  byDateSettings: any = null
  byCategorySettings: any = null
  data!: FlowChart

  level: 'BY_DATE' | 'BY_CATEGORY' | 'BY_ACCOUNT' = 'BY_DATE'

  totalIncome: string = '0'
  totalExpense: string = '0'
  total: string = '0'

  constructor(
    private flowChartService: FlowChartService,
    private referenceService: ReferenceService,
    private documentService: DocumentService,
    private router: Router
  ) {
    this.referenceService.list('/account/reference')
      .subscribe(result => {
        for (let reference of result) {
          this.accounts.set(reference.id, reference)
        }
      })
    this.referenceService.list('/expense/reference')
      .subscribe(result => {
        this.expenseCategories = result
        for (let reference of result) {
          this.categories.set(reference.id, reference)
        }
        this.selectAllCategories()
      })
    this.referenceService.list('/income/reference')
      .subscribe(result => {
        this.incomeCategories = result
        for (let reference of result) {
          this.categories.set(reference.id, reference)
        }
        this.selectAllCategories()
      })
  }

  ngAfterViewInit(): void {
    let chart = echarts.init(this.chartContainer.nativeElement)
    window.onresize = function () {
      chart.resize()
    }
    chart.on('click', params => this.forward(params))
    this.chart = chart
  }

  ngOnDestroy(): void {
    this.chart.dispose()
  }

  isBackAvailable(): boolean {
    return this.level != 'BY_DATE'
  }

  back() {
    if (this.level == 'BY_ACCOUNT') {
      this.level = 'BY_CATEGORY'
      this.settings.patchValue(this.byCategorySettings)
      this.apply()
    } else if (this.level == 'BY_CATEGORY') {
      this.level = 'BY_DATE'
      this.settings.patchValue(this.byDateSettings)
      this.apply()
    }
  }

  forward(params: any) {
    if (this.level == 'BY_DATE') {
      this.byDateSettings = this.settings.value
      this.level = 'BY_CATEGORY'
      this.settings.patchValue({
        dateFrom: moment(params.name).format('yyyy-MM-DD'),
        dateTo: moment(params.name).add(1, 'month').format('yyyy-MM-DD'),
        type: params.seriesName
      })
      this.apply()
    } else if (this.level == 'BY_CATEGORY') {
      this.byCategorySettings = this.settings.value
      this.level = 'BY_ACCOUNT'
      this.settings.patchValue({
        categories: [params.name]
      })
      this.apply()
    } else if (this.level == 'BY_ACCOUNT') {
      this.documentService.updateSettings({
        dateFrom: this.settings.value.dateFrom,
        dateTo: this.settings.value.dateTo,
        type: this.settings.value.type == 'IN' ? 'income' : 'expense',
        categories: this.settings.value.categories,
        account: params.name
      })
      this.router.navigate(['document']).then()
    }
  }

  apply() {
    this.filter.close()
    this.flowChartService.load({
      dateFrom: this.settings.value.dateFrom,
      dateTo: this.settings.value.dateTo,
      type: this.settings.value.type,
      categories: this.settings.value.categories,
      commonCurrency: this.settings.value.commonCurrency,
    }).subscribe(result => {
      this.data = result
      if (this.level == 'BY_DATE') {
        this.chartByDate()
      } else if (this.level == 'BY_CATEGORY') {
        this.chartByCategory()
      } else if (this.level == 'BY_ACCOUNT') {
        this.chartByAccount()
      }
    })
  }

  toggleAllCategories() {
    if (this.settings.value.categories.length == 0) {
      this.selectAllCategories()
    } else {
      this.settings.patchValue({
        categories: []
      })
    }
  }

  private selectAllCategories() {
    this.settings.patchValue({
      categories: this.expenseCategories.map(category => category.id).concat(
        this.incomeCategories.map(category => category.id)
      )
    })
  }

  private sum(entries: FlowChartEntry[]): string {
    return entries.map(entry => toFractional(entry.commonAmount))
      .reduce((a, b) => a + b, 0)
      .toFixed(2)
  }

  private chartByDate() {
    this.totalIncome = this.sum(this.data.entries.filter(entry => entry.type == 'IN'))
    this.totalExpense = this.sum(this.data.entries.filter(entry => entry.type == 'OUT'))

    let commonCurrency = this.settings.value.commonCurrency
    let index = new Map<string,DateEntry>()
    for (let entry of this.data.entries) {
      let date = moment(entry.date).startOf('month').format('yyyy-MM-DD')
      let indexEntry = index.get(date)
      if (!indexEntry) {
        indexEntry = new DateEntry()
        indexEntry.date = date
        indexEntry.expense = emptyAmount(commonCurrency)
        indexEntry.income = emptyAmount(commonCurrency)
        index.set(date, indexEntry)
      }

      if (entry.type == 'IN') {
        indexEntry.income = plus(indexEntry.income, entry.commonAmount)
      } else {
        indexEntry.expense = plus(indexEntry.expense, entry.commonAmount)
      }
    }

    let funds = [...index.values()].sort((a, b) => a.date.localeCompare(b.date))
    let positionThreshold = Math.max(...funds.map(entry => toFractional(entry.income)), ...funds.map(entry => toFractional(entry.expense))) * .25
    this.chartHeight = funds.length * 4

    let option = {
      xAxis: {
        type: 'value',
        show: false
      },
      yAxis: {
        type: 'category',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        data: funds.map(entry => entry.date)
      },
      series: [
        {
          type: 'bar',
          name: 'IN',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            borderRadius: 5,
            color: '#66bb6a'
          },
          barGap: '10%',
          barCategoryGap: '10%',
          data: funds.map(entry => {
            let commonAmount = toFractional(entry.income);
            return {
              value: commonAmount,
              label: {
                show: true,
                formatter: formatAsString(entry.income),
                position: commonAmount < positionThreshold ? 'right' : 'insideLeft'
              }
            }
          })
        },
        {
          type: 'bar',
          name: 'OUT',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            borderRadius: 5,
            color: '#ef5350'
          },
          barGap: '10%',
          barCategoryGap: '10%',
          data: funds.map(entry => {
            let commonAmount = toFractional(entry.expense);
            return {
              value: commonAmount,
              label: {
                show: true,
                formatter: formatAsString(entry.expense),
                position: commonAmount < positionThreshold ? 'right' : 'insideLeft'
              }
            }
          })
        }
      ],
      grid: {
        left: '80',
        right: '5%',
        bottom: '5%',
        top: '5%'
      },
    }
    setTimeout(() => {
      this.chart.resize()
      this.chart.clear()
      this.chart.setOption(option)
    }, 10)
  }

  private chartByCategory() {
    this.total = this.sum(this.data.entries)

    let commonCurrency = this.settings.value.commonCurrency
    let index = new Map<string,CategoryEntry>()
    for (let entry of this.data.entries) {
      let indexEntry = index.get(entry.category)
      if (!indexEntry) {
        indexEntry = new CategoryEntry()
        indexEntry.category = entry.category
        indexEntry.categoryName = this.categories.get(entry.category)?.name || entry.category
        indexEntry.amount = emptyAmount(commonCurrency)
        index.set(entry.category, indexEntry)
      }

      indexEntry.amount = plus(indexEntry.amount, entry.commonAmount)
    }

    let funds = [...index.values()].sort((a, b) => a.amount.value - b.amount.value)
    let positionThreshold = Math.max(...funds.map(entry => toFractional(entry.amount))) * .25
    this.chartHeight = funds.length * 2.5

    let option = {
      xAxis: {
        type: 'value',
        show: false
      },
      yAxis: {
        type: 'category',
        axisLabel: {
          formatter: (value: string) => this.categories.get(value)?.name || value
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        data: funds.map(entry => entry.category)
      },
      series: [
        {
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            borderRadius: 5
          },
          barGap: '10%',
          barCategoryGap: '10%',
          data: funds.map(entry => {
            let commonAmount = toFractional(entry.amount);
            return {
              value: commonAmount,
              label: {
                show: true,
                formatter: formatAsString(entry.amount),
                position: commonAmount < positionThreshold ? 'right' : 'insideLeft'
              }
            }
          })
        }
      ],
      grid: {
        left: '80',
        right: '5%',
        bottom: '5%',
        top: '5%'
      }
    }
    setTimeout(() => {
      this.chart.resize()
      this.chart.clear()
      this.chart.setOption(option)
    }, 10)
  }

  private chartByAccount() {
    this.total = this.sum(this.data.entries)

    let commonCurrency = this.settings.value.commonCurrency
    let index = new Map<string,AccountEntry>()
    for (let entry of this.data.entries) {
      let indexEntry = index.get(entry.account)
      if (!indexEntry) {
        indexEntry = new AccountEntry()
        indexEntry.account = entry.account
        indexEntry.accountName = this.accounts.get(entry.account)?.name || entry.account
        indexEntry.amount = emptyAmount(commonCurrency)
        index.set(entry.account, indexEntry)
      }

      indexEntry.amount = plus(indexEntry.amount, entry.commonAmount)
    }

    let funds = [...index.values()].sort((a, b) => a.amount.value - b.amount.value)
    let positionThreshold = Math.max(...funds.map(entry => toFractional(entry.amount))) * .25
    this.chartHeight = funds.length * 2.5

    let option = {
      xAxis: {
        type: 'value',
        show: false
      },
      yAxis: {
        type: 'category',
        axisLabel: {
          formatter: (value: string) => this.accounts.get(value)?.name || value
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        data: funds.map(entry => entry.account)
      },
      series: [
        {
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            borderRadius: 5
          },
          barGap: '10%',
          barCategoryGap: '10%',
          data: funds.map(entry => {
            let commonAmount = toFractional(entry.amount);
            return {
              value: commonAmount,
              label: {
                show: true,
                formatter: formatAsString(entry.amount),
                position: commonAmount < positionThreshold ? 'right' : 'insideLeft'
              }
            }
          })
        }
      ],
      grid: {
        left: '80',
        right: '5%',
        bottom: '5%',
        top: '5%'
      }
    }
    setTimeout(() => {
      this.chart.resize()
      this.chart.clear()
      this.chart.setOption(option)
    }, 10)
  }

}

class DateEntry {
  date!: string
  income!: Amount
  expense!: Amount
}

class CategoryEntry {
  category!: string
  categoryName!: string
  amount!: Amount
}

class AccountEntry {
  account!: string
  accountName!: string
  amount!: Amount
}
