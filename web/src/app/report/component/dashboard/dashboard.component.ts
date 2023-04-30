import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {Dashboard} from "../../model/dashboard";
import {DashboardService} from "../../service/dashboard.service";
import {Router} from "@angular/router";
import {DocumentService} from "../../../document/service/document.service";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {formatAsString} from "../../../common/model/amount";

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
        this.refreshChart()
      })
  }

  fundSnapshot() {
    this.router.navigate(['fund-snapshot']).then()
  }

  fastExpense() {
    this.router.navigate(['fast-expense']).then()
  }

  fastExchange() {
    this.router.navigate(['fast-exchange']).then()
  }

  fundChartHeight(): string {
    return `${this.dashboard.funds.length * 2}em`;
  }

  private refreshChart() {
    let data = this.dashboard.funds.sort((a,b) => a.weight - b.weight)
    let option = {
      grid: {
        top: '5%',
        bottom: '5%',
        left: '5%',
        right: '5%'
      },
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
          label: {
            show: true,
            position: 'insideLeft',
            color: '#000',
          },
          barMinHeight: 5,
          barCategoryGap: '10%',
          data: data.map(fund => {
            return {
              value: fund.weight,
              label: {
                formatter: formatAsString(fund.amount, true)
              }
            }
          })
        }
      ]
      // series: this.dashboard.funds.sort((a,b) => b.weight - a.weight).map(fund => {
      //   return {
      //     type: 'bar',
      //     data: [fund.weight == 0 ? 2 : fund.weight],
      //     label: {
      //       show: true,
      //       formatter: formatAsString(fund.amount, true),
      //       position: 'insideLeft',
      //       align: 'left',
      //     }
      //   }
      // })
    }
    this.chart.resize()
    this.chart.clear()
    this.chart.setOption(option)
    setTimeout(() => this.chart.resize(), 10)
  }

}
