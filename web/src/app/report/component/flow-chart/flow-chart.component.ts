import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {SettingsService} from "../../../settings/service/settings.service";
import {FlowChartService} from "../../service/flow-chart.service";
import {FormGroup} from "@angular/forms";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {toFractional} from "../../../common/model/amount";
import {FlowChartSeries} from "../../model/flow-chart-series";

@Component({
  selector: 'flow-chart',
  templateUrl: 'flow-chart.component.html',
  styleUrls: ['flow-chart.component.scss']
})
export class FlowChartComponent implements AfterViewInit, OnDestroy {

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts

  constructor(
    private flowChartService: FlowChartService,
    public settingsService: SettingsService
  ) {}

  ngAfterViewInit(): void {
    let chart = echarts.init(this.chartContainer.nativeElement)
    window.onresize = function () {
      chart.resize()
    }
    this.chart = chart
    this.flowChartService.onLoad.subscribe(() => this.refreshChart())
    this.flowChartService.load()
  }

  ngOnDestroy(): void {
    this.chart.dispose()
  }

  filter(): FormGroup {
    return this.flowChartService.settings
  }

  private refreshChart() {

    let totalExpense = this.seriesOptions(this.flowChartService.data.totalExpense, 'totalExpense')
    totalExpense.barWidth = 10

    let option = {
      xAxis: {
        type: 'category',
        data: this.flowChartService.data.dates
      },
      yAxis: {
        type: 'value'
      },
      series: [
        totalExpense,
        ...this.flowChartService.data.expenses.map(series => this.seriesOptions(series, 'expense')),
        ...this.flowChartService.data.incomes.map(series => this.seriesOptions(series, 'income'))
      ],
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        top: '25%',
        containLabel: true
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {}
    }
    this.chart.resize()
    this.chart.setOption(option)
  }

  private seriesOptions(series: FlowChartSeries, type: string): any {
    return {
      name: series.category,
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      stack: type,
      data: series.amounts.map(amount => toFractional(amount))
    }
  }

}
