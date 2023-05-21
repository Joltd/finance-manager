import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {FlowChartService} from "../../service/flow-chart.service";
import {FormControl, FormGroup} from "@angular/forms";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {Amount, emptyAmount, plus, toFractional} from "../../../common/model/amount";
import {ReferenceService} from "../../../common/service/reference.service";
import {Reference} from "../../../common/model/reference";
import * as moment from "moment";
import {FlowChart, FlowChartEntry} from "../../model/flow-chart";
import {MatExpansionPanel} from "@angular/material/expansion";

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
    commonCurrency: new FormControl('USD'),
    byCurrency: new FormControl(false)
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
    private referenceService: ReferenceService
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
        dateFrom: moment(params.name),
        dateTo: moment(params.name).add(1, 'month'),
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
    })
      .subscribe(result => {
        this.data = result
        this.calcTotal()
        let groupData = this.groupData()
        this.chartHeight = groupData.firstDimensions.length * groupData.secondDimensions.length * 2.5
        setTimeout(() => this.refreshChart(groupData), 10)
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

  private refreshChart(groupData: GroupData) {
    let allCommonAmounts = [...groupData.data.values()]
      .flatMap(it => [...it.values()])
      .map(value => toFractional(value.commonAmount))
    let positionThreshold = Math.max(...allCommonAmounts) * .15
    let option = {
      xAxis: {
        type: 'value',
        show: false
      },
      yAxis: {
        type: 'category',
        axisLabel: {
          formatter: (value: string) => this.dimensionName(value)
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        min: 0.1,
        data: groupData.firstDimensions
      },
      series: groupData.secondDimensions.map(secondDimension => {
        let commonCurrency = this.settings.value.commonCurrency;
        let data = groupData.firstDimensions.map(firstDimension => groupData.getValue(firstDimension, secondDimension, commonCurrency))
        return {
          name: secondDimension,
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            borderRadius: 5
          },
          barGap: '10%',
          barCategoryGap: '10%',
          data: data.map(value => {
            let amount = this.level != 'BY_DATE' && this.settings.value.byCurrency
              ? toFractional(value.amount)
              : toFractional(value.commonAmount)
            let commonAmount = toFractional(value.commonAmount)
            return {
              value: commonAmount,
              label: {
                show: true,
                formatter: this.level == 'BY_DATE' ? amount : `${amount} {a}`,
                position: commonAmount < positionThreshold ? 'right' : 'insideLeft',
              }
            }
          })
        }
      }),
      grid: {
        left: '80',
        right: '5%',
        bottom: '5%',
        top: '5%'
      },
    }
    this.chart.clear()
    this.chart.setOption(option)
    this.chart.resize()
  }

  private calcTotal() {
    if (this.level == 'BY_DATE') {
      this.totalIncome = this.sum(this.data.entries.filter(entry => entry.type == 'IN'))
      this.totalExpense = this.sum(this.data.entries.filter(entry => entry.type == 'OUT'))
    } else {
      this.total = this.sum(this.data.entries)
    }
  }

  private sum(entries: FlowChartEntry[]): string {
    return entries.map(entry => toFractional(entry.commonAmount))
      .reduce((a, b) => a + b, 0)
      .toFixed(2)
  }

  private groupData(): GroupData {

    let result = new Map<string,Map<string,GroupValue>>()
    let firstDimensions = new Set<string>()
    let secondDimensions = new Set<string>()

    for (let entry of this.data.entries) {
      let firstDimension = this.firstDimension(entry)
      firstDimensions.add(firstDimension)

      let secondDimension = this.secondDimension(entry)
      secondDimensions.add(secondDimension)

      let group = result.get(firstDimension) || new Map<string,GroupValue>()
      result.set(firstDimension, group)

      let accumulated = group.get(secondDimension)
      if (!accumulated) {
        group.set(secondDimension, new GroupValue(entry.amount, entry.commonAmount))
      } else {
        if (this.settings.value.byCurrency && this.level != 'BY_DATE') {
          accumulated.amount = plus(accumulated.amount, entry.amount)
        }
        accumulated.commonAmount = plus(accumulated.commonAmount, entry.commonAmount)
      }
    }

    let groupData = new GroupData()
    groupData.firstDimensions = [...firstDimensions].sort((a, b) => a.localeCompare(b))
    groupData.secondDimensions = [...secondDimensions].sort((a, b) => a.localeCompare(b))
    groupData.data = result
    return groupData

  }

  private firstDimension(entry: FlowChartEntry): string {
    if (this.level == 'BY_DATE') {
      return moment(entry.date).startOf('month').format('yyyy-MM-DD')
    } else if (this.level == 'BY_CATEGORY') {
      return entry.category
    } else if (this.level == 'BY_ACCOUNT') {
      return entry.account
    } else {
      throw Error('Unknown chart level ' + this.level)
    }
  }

  private secondDimension(entry: FlowChartEntry): string {
    if (this.level == 'BY_DATE') {
      return entry.type
    } else if (this.settings.value.byCurrency) {
      return entry.amount.currency
    } else {
      return entry.commonAmount.currency
    }
  }

  private dimensionName(dimension: string): string {
    if (this.level == 'BY_DATE') {
      return dimension
    } else if (this.level == 'BY_CATEGORY') {
      return this.categories.get(dimension)?.name || dimension
    } else if (this.level == 'BY_ACCOUNT') {
      return this.accounts.get(dimension)?.name || dimension
    } else {
      throw Error('Unknown chart level ' + this.level)
    }
  }

}

class GroupData {
  firstDimensions: string[] = []
  secondDimensions: string[] = []
  data!: Map<string,Map<string,GroupValue>>

  getValue(first: string, second: string, commonCurrency: string): GroupValue {
    let group = this.data.get(first) || new Map<string,GroupValue>()
    return group.get(second) || new GroupValue(emptyAmount(second), emptyAmount(commonCurrency))
  }
}

class GroupValue {
  amount!: Amount
  commonAmount!: Amount

  constructor(amount: Amount, commonAmount: Amount) {
    this.amount = amount;
    this.commonAmount = commonAmount;
  }
}
