import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {Dashboard, Fund} from "../../model/dashboard";
import {DashboardService} from "../../service/dashboard.service";
import {Router} from "@angular/router";
import {DocumentService} from "../../../document/service/document.service";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {Amount, formatAsString, plus, toFractional} from "../../../common/model/amount";
import {Reference} from "../../../common/model/reference";
import {ReferenceService} from "../../../common/service/reference.service";

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts
  chartHeight: number = 0

  private accounts: Map<string,Reference> = new Map<string,Reference>()

  private currency!: string
  public dashboard: Dashboard = new Dashboard()

  private level: 'BY_CURRENCY' | 'BY_ACCOUNT' = 'BY_CURRENCY'

  constructor(
    private dashboardService: DashboardService,
    private documentService: DocumentService,
    private referenceService: ReferenceService,
    private router: Router
  ) {
    this.referenceService.list('/account/reference')
      .subscribe(result => {
        for (let reference of result) {
          this.accounts.set(reference.id, reference)
        }
      })
  }

  ngAfterViewInit(): void {
    let chart = echarts.init(this.chartContainer.nativeElement)
    window.onresize = function () {
      chart.resize()
    }
    chart.on('click', (params) => this.forward(params))
    this.chart = chart
    this.load()
  }

  ngOnDestroy(): void {
    this.chart.dispose()
  }

  forward(params: any) {
    if (this.level == 'BY_CURRENCY') {
      this.currency = params.name
      this.level = 'BY_ACCOUNT'
      this.apply()
    } else {
      this.level = 'BY_CURRENCY'
      this.apply()
    }

  }

  private apply() {
    let groupData = this.groupData()
    this.chartHeight = groupData.size * 3
    console.log(this.chartHeight)
    setTimeout(() => this.refreshChart(groupData), 10)
  }

  private load() {
    this.dashboardService.load()
      .subscribe(result => {
        this.dashboard = result
        this.apply()
      })
  }

  fastExpense() {
    this.router.navigate(['fast-expense']).then()
  }

  fastExchange() {
    this.router.navigate(['fast-exchange']).then()
  }

  private refreshChart(groupData: Map<string, ChartValue>) {
    let allCommonAmounts = [...groupData.values()].map(value => toFractional(value.commonAmount))
    let positionThreshold = Math.max(...allCommonAmounts) * .15
    let option = {
      xAxis: {
        type: 'value',
        show: false,
      },
      yAxis: {
        type: 'category',
        axisLabel: {
          formatter: (value: string) => this.level == 'BY_ACCOUNT' ? this.accounts.get(value)?.name : value
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        data: [...groupData.keys()],
        show: this.level == 'BY_ACCOUNT',
      },
      series: [
        {
          type: 'bar',
          itemStyle: {
            borderRadius: 5
          },
          barGap: '15%',
          barCategoryGap: '15%',
          data: [...groupData.entries()].map(entry => {
            let commonAmount = toFractional(entry[1].commonAmount);
            return {
              name: entry[0],
              value: commonAmount,
              label: {
                show: true,
                formatter: formatAsString(entry[1].amount, true),
                position: commonAmount < positionThreshold ? 'right' : 'insideLeft'
              }
            }
          })
        }
      ],
      grid: {
        top: '10',
        bottom: '10',
        left: this.level == 'BY_ACCOUNT' ? '80' : '10',
        right: '10'
      }
    }
    this.chart.resize()
    this.chart.clear()
    this.chart.setOption(option)
  }

  private groupData(): Map<string,ChartValue> {
    let result = new Map<string,ChartValue>()
    for (let fund of this.dashboard.funds) {
      if (this.level == 'BY_ACCOUNT' && fund.amount.currency != this.currency) {
        continue
      }

      let dimension = this.level == 'BY_ACCOUNT' ? fund.account : fund.amount.currency

      let accumulated = result.get(fund.amount.currency)
      if (!accumulated) {
        result.set(dimension, new ChartValue(fund.amount, fund.commonAmount))
      } else {
        accumulated.amount = plus(accumulated.amount, fund.amount)
        accumulated.commonAmount = plus(accumulated.commonAmount, fund.commonAmount)
      }

    }
    return result
  }

}

class ChartValue {
  amount!: Amount
  commonAmount!: Amount

  constructor(amount: Amount, commonAmount: Amount) {
    this.amount = amount
    this.commonAmount = commonAmount
  }
}
