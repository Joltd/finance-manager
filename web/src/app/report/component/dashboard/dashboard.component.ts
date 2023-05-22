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

  private currency: string | null = null
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
    chart.on('click', (params) => this.toggleLevel(params))
    this.chart = chart
    this.load()
  }

  ngOnDestroy(): void {
    this.chart.dispose()
  }

  toggleLevel(params: any) {
    if (this.level == 'BY_CURRENCY') {
      this.currency = params.name
      this.level = 'BY_ACCOUNT'
      this.apply()
    } else {
      this.currency = null
      this.level = 'BY_CURRENCY'
      this.apply()
    }

  }

  private apply() {
    if (this.level == 'BY_CURRENCY') {
      this.chartByCurrency()
    } else if (this.level == 'BY_ACCOUNT') {
      this.chartByAccount()
    }
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

  private chartByCurrency() {

    let groupIndex = new Map<string,Fund>()
    for (let fund of this.dashboard.funds) {
      let group = groupIndex.get(fund.amount.currency)
      if (group) {
        group.amount = plus(group.amount, fund.amount)
        group.commonAmount = plus(group.commonAmount, fund.commonAmount)
      } else {
        group = new Fund()
        group.amount = fund.amount
        group.commonAmount = fund.commonAmount
        groupIndex.set(fund.amount.currency, group)
      }
    }

    let groups = [...groupIndex.values()].sort((a, b) => a.commonAmount.value - b.commonAmount.value)
    let positionThreshold = Math.max(...groups.map(group => toFractional(group.commonAmount))) * .15
    this.chartHeight = Math.max(4, groups.length * 2.5)

    let option = {
      xAxis: {
        type: 'value',
        show: false,
      },
      yAxis: {
        type: 'category',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        show: false,
        data: groups.map(group => group.amount.currency)
      },
      series: [
        {
          type: 'bar',
          itemStyle: {
            borderRadius: 5
          },
          barGap: '15%',
          data: groups.map(group => {
            let commonAmount = toFractional(group.commonAmount)
            return {
              name: group.amount.currency,
              value: commonAmount,
              label: {
                show: true,
                formatter: formatAsString(group.amount, true),
                position: commonAmount < positionThreshold ? 'right' : 'insideLeft'
              }
            }
          })
        }
      ],
      grid: {
        top: '10',
        bottom: '10',
        right: '10',
        left: '10'
      }
    }
    setTimeout(() => {
      this.chart.resize()
      this.chart.clear()
      this.chart.setOption(option)
    }, 10)
  }

  private chartByAccount() {
    let funds = this.dashboard.funds
      .filter(fund => fund.amount.currency == this.currency)
      .sort((a, b) => a.commonAmount.value - b.commonAmount.value)
    let positionThreshold = Math.max(...funds.map(fund => toFractional(fund.commonAmount))) * .15
    this.chartHeight = Math.max(4, funds.length * 2.5)

    let option = {
      xAxis: {
        type: 'value',
        show: false,
      },
      yAxis: {
        type: 'category',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        show: true,
        data: funds.map(fund => formatAsString(fund.amount))
      },
      series: [
        {
          type: 'bar',
          itemStyle: {
            borderRadius: 5
          },
          barGap: '15%',
          data: funds.map(fund => {
            let commonAmount = toFractional(fund.commonAmount);
            return {
              value: commonAmount,
              label: {
                show: true,
                formatter: this.accounts.get(fund.account)?.name,
                position: commonAmount < positionThreshold ? 'right' : 'insideLeft'
              }
            }
          })
        }
      ],
      grid: {
        top: '10',
        bottom: '10',
        right: '10',
        left: '120'
      }
    }
    setTimeout(() => {
      this.chart.resize()
      this.chart.clear()
      this.chart.setOption(option)
    }, 10)
  }

}
