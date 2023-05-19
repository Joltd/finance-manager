import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {FlowChartService} from "../../service/flow-chart.service";
import {FormControl, FormGroup} from "@angular/forms";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {Amount, toFractional} from "../../../common/model/amount";
import {ReferenceService} from "../../../common/service/reference.service";
import {Reference} from "../../../common/model/reference";
import * as moment from "moment";
import {FlowChart, FlowChartEntry} from "../../model/flow-chart";

@Component({
  selector: 'flow-chart',
  templateUrl: 'flow-chart.component.html',
  styleUrls: ['flow-chart.component.scss']
})
export class FlowChartComponent implements AfterViewInit, OnDestroy {

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts

  expenseCategories: Reference[] = []
  incomeCategories: Reference[] = []

  settings: FormGroup = new FormGroup({
    dateFrom: new FormControl(moment().subtract(3, 'month').format('yyyy-MM-DD')),
    dateTo: new FormControl(moment().format('yyyy-MM-DD')),
    categories: new FormControl([]),
    commonCurrency: new FormControl('USD'),
    byCurrency: new FormControl(false)
  })
  data!: FlowChart

  level: 'BY_DATE' | 'BY_CATEGORY' | 'BY_ACCOUNT' = 'BY_DATE'

  constructor(
    private flowChartService: FlowChartService,
    private referenceService: ReferenceService
  ) {
    this.referenceService.list('/expense/reference')
      .subscribe(result => {
        this.expenseCategories = result
        this.selectAllCategories()
      })
    this.referenceService.list('/income/reference')
      .subscribe(result => {
        this.incomeCategories = result
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
      this.apply()
    } else if (this.level == 'BY_CATEGORY') {
      this.level = 'BY_DATE'
      this.apply()
    }
  }

  forward(params: any) {
    console.log(params)
    if (this.level == 'BY_DATE') {
      this.level = 'BY_CATEGORY'
      this.apply()
    } else if (this.level == 'BY_CATEGORY') {
      this.level = 'BY_ACCOUNT'
      this.apply()
    }
  }

  apply() {
    // collapse filter panel
    this.flowChartService.load(this.settings.value)
      .subscribe(result => {
        this.data = result
        this.refreshChart()
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

  private refreshChart() {
    let groupData = this.groupData()

    let option = {
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        axisLabel: {
          rotate: 90
        },
        data: groupData.firstDimensions
      },
      series: groupData.secondDimensions.map(secondDimension => {
        return {
          name: secondDimension,
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          label: {
            show: true,
            position: 'right'
          },
          data: groupData.firstDimensions.map(firstDimension => {
            let group = groupData.data.get(firstDimension) || new Map<string,number>
            return group.get(secondDimension) || 0
          })
        }
      }),
      grid: {
        left: '5%',
        right: '5%',
        bottom: '5%',
        top: '5%',
        // containLabel: true
      },
  //     tooltip: {
  //       trigger: 'item',
  //       axisPointer: {
  //         type: 'shadow'
  //       },
  //       valueFormatter: (value: number) => value
  //     },
  //     legend: {
  //       type: 'scroll',
  //       left: '3%',
  //       top: '3%',
  //       // right: '15%',
  //       // bottom: '15%'
  //     },
  //     color: ['#ef5350', '#66bb6a'],
  //     dataZoom: {
  //       type: 'inside',
  //       orient: 'vertical'
  //     }
    }
    this.chart.resize()
    this.chart.clear()
    this.chart.setOption(option)
  }

  // private drillDown(params: any) {
  //   let groupBy = this.flowChartService.settings.value.groupBy
  //   let date = this.flowChartService.data.dates[params.dataIndex]
  //   this.categoryChartService.settings.patchValue({
  //     dateFrom: moment(date).format('yyyy-MM-DD'),
  //     dateTo: moment(date).add(1, groupBy).format('yyyy-MM-DD'),
  //     expenseCategories: this.flowChartService.settings.value.expenseCategories,
  //     incomeCategories: this.flowChartService.settings.value.incomeCategories,
  //     groupBy: params.seriesIndex == 0 ? 'expense' : 'income'
  //   })
  //   this.router.navigate(['category-chart']).then()
  // }

  private groupData(): GroupData {

    let result = new Map<string,Map<string,number>>()
    let firstDimensions = new Set<string>()
    let secondDimensions = new Set<string>()

    for (let entry of this.data.entries) {
      let firstDimension = this.firstDimension(entry)
      firstDimensions.add(firstDimension)

      let secondDimension = this.secondDimension(entry)
      secondDimensions.add(secondDimension)

      let group = result.get(firstDimension) || new Map<string,number>()
      result.set(firstDimension, group)

      let accumulated = group.get(secondDimension) || 0
      group.set(secondDimension, accumulated + toFractional(this.measure(entry)))
    }

    return {
      firstDimensions: [...firstDimensions].sort((a, b) => a.localeCompare(b)),
      secondDimensions: [...secondDimensions].sort((a, b) => a.localeCompare(b)),
      data: result
    } as GroupData

  }

  private firstDimension(entry: FlowChartEntry): string {
    if (this.level == 'BY_DATE') {
      return entry.date
    } else if (this.level == 'BY_CATEGORY') {
      return entry.category
    } else if (this.level == 'BY_ACCOUNT') {
      return entry.account
    } else {
      throw Error('Unknown chart levle ' + this.level)
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

  private measure(entry: FlowChartEntry): Amount {
    if (this.settings.value.byCurrency) {
      return entry.amount
    } else {
      return entry.commonAmount
    }
  }

}

class GroupData {
  firstDimensions: string[] = []
  secondDimensions: string[] = []
  data!: Map<string,Map<string,number>>
}
