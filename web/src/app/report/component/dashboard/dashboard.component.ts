import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {AccountBalance} from "../../model/account-balance";
import {Dashboard} from "../../model/dashboard";
import {DashboardService} from "../../service/dashboard.service";
import {Router} from "@angular/router";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {toFractional} from "../../../common/model/amount";
import * as moment from "moment";

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts

  dashboard: Dashboard = new Dashboard()

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.chart = echarts.init(this.chartContainer.nativeElement)
    let chart = this.chart
    window.onresize = function () {
      chart.resize()
    }
    this.load()
  }

  ngOnDestroy(): void {
    this.chart.dispose()
  }

  private load() {
    this.dashboardService.load()
      .subscribe(result => {
        this.dashboard = result
        this.buildFlowChart()
      })
  }

  viewDocuments(account: string, currency: string) {
    if (!account) {
      return
    }
    this.router.navigate(
      ['document'],
      {
        queryParams: {account, currency}
      }
    ).then()
  }

  private buildFlowChart() {
    this.chart.setOption({
      xAxis: {
        data: this.dashboard.flowChart.dates
      },
      yAxis: {},
      series: this.dashboard.flowChart.series.map(series => {
        return {
          name: series.category,
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          stack: series.type,
          data: series.amounts.map(amount => toFractional(amount))
        }
      }),
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {}
    })
  }

}
