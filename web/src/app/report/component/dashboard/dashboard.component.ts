import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {Dashboard} from "../../model/dashboard";
import {DashboardService} from "../../service/dashboard.service";
import {Router} from "@angular/router";
import {DocumentService} from "../../../document/service/document.service";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {formatAsString, toFractional} from "../../../common/model/amount";

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {

  public dashboard: Dashboard = new Dashboard()

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts
  chartHeight: number = 0

  constructor(
    private dashboardService: DashboardService,
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    let chart = echarts.init(this.chartContainer.nativeElement)
    window.onresize = function () {
      chart.resize()
    }
    this.chart = chart
    this.load()
  }

  ngOnDestroy(): void {
    this.chart.dispose()
  }

  private load() {
    this.dashboardService.load()
      .subscribe(result => {
        this.dashboard = result
        this.chartHeight = result.funds.length * 2.5
        setTimeout(() => this.refreshChart(), 10)
      })
  }

  fastExpense() {
    this.router.navigate(['fast-expense']).then()
  }

  fastExchange() {
    this.router.navigate(['fast-exchange']).then()
  }

  private refreshChart() {
    let data = this.dashboard.funds.sort((a,b) => a.weight - b.weight)
    let positionThreshold = Math.max(...data.map(fund => fund.weight)) * .15
    let option = {
      xAxis: {
        type: 'value',
        show: false,
      },
      yAxis: {
        type: 'category',
        data: data.map(fund => fund.amount.currency),
        show: false,
      },
      series: [
        {
          type: 'bar',
          itemStyle: {
            borderRadius: 5
          },
          barGap: '15%',
          barCategoryGap: '15%',
          data: data.map(fund => {
            return {
              value: fund.weight,
              label: {
                show: true,
                formatter: formatAsString(fund.amount, true),
                position: fund.weight < positionThreshold ? 'right' : 'insideLeft'
              }
            }
          })
        }
      ],
      grid: {
        top: '10',
        bottom: '10',
        left: '10',
        right: '10'
      }
    }
    this.chart.resize()
    this.chart.clear()
    this.chart.setOption(option)
  }

}
