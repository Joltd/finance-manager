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

    let option = {
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        axisLabel: {
          rotate: 90
        },
        data: this.flowChartService.data.dates
      },
      series: this.flowChartService.data.flows.map(series => this.seriesOptions(series)),
      grid: {
        left: '2%',
        right: '6%',
        bottom: '2%',
        top: '10%',
        containLabel: true
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        type: 'scroll',
        left: '3%',
        top: '3%',
        // right: '15%',
        // bottom: '15%'
      }
    }
    this.chart.resize()
    this.chart.clear()
    this.chart.setOption(option)
  }

  private seriesOptions(series: FlowChartSeries): any {
    return {
      name: series.category,
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      label: {
        show: true,
        position: 'right'
      },
      data: series.amounts.map(amount => toFractional(amount))
    }
  }

}
