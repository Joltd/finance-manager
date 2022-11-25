import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {FlowChartService} from "../../service/flow-chart.service";
import {FormGroup} from "@angular/forms";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {toFractional} from "../../../common/model/amount";
import {FlowChartSeries} from "../../model/flow-chart-series";
import {ReferenceService} from "../../../common/service/reference.service";
import {Reference} from "../../../common/model/reference";
import * as moment from "moment";
import {CategoryChartService} from "../../service/category-chart.service";
import {Router} from "@angular/router";
import {Total} from "../../model/total";

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

  totals: Total[] = []

  constructor(
    private flowChartService: FlowChartService,
    private categoryChartService: CategoryChartService,
    private referenceService: ReferenceService,
    private router: Router
  ) {
    this.referenceService.list('/expense/reference')
      .subscribe(result => this.expenseCategories = result)
    this.referenceService.list('/income/reference')
      .subscribe(result => this.incomeCategories = result)
  }

  ngAfterViewInit(): void {
    let chart = echarts.init(this.chartContainer.nativeElement)
    window.onresize = function () {
      chart.resize()
    }
    chart.on('click', params => this.drillDown(params))
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

  allExpenseCategories() {
    this.filter().patchValue({
      expenseCategories: this.expenseCategories.map(category => category.id)
    })
  }

  allIncomeCategories() {
    this.filter().patchValue({
      incomeCategories: this.incomeCategories.map(category => category.id)
    })
  }

  private refreshChart() {
    this.totals = []
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
        },
        valueFormatter: (value: number) => value
      },
      legend: {
        type: 'scroll',
        left: '3%',
        top: '3%',
        // right: '15%',
        // bottom: '15%'
      },
      color: ['#ef5350', '#66bb6a'],
      dataZoom: {
        type: 'inside',
        orient: 'vertical'
      }
    }
    this.chart.resize()
    this.chart.clear()
    this.chart.setOption(option)
  }

  private seriesOptions(series: FlowChartSeries): any {
    let data = series.amounts.map(amount => Math.floor(toFractional(amount)))
    let average = data.reduce((previous, current) => previous + current, 0) / data.length
    this.totals.push({
      category: series.category,
      amount: Math.floor(average)
    })
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
      data: data
    }
  }

  private drillDown(params: any) {
    let groupBy = this.flowChartService.settings.value.groupBy
    let date = this.flowChartService.data.dates[params.dataIndex]
    this.categoryChartService.settings.patchValue({
      dateFrom: moment(date).format('yyyy-MM-DD'),
      dateTo: moment(date).add(1, groupBy).format('yyyy-MM-DD'),
      expenseCategories: this.flowChartService.settings.value.expenseCategories,
      incomeCategories: this.flowChartService.settings.value.incomeCategories,
      groupBy: params.seriesIndex == 0 ? 'expense' : 'income'
    })
    this.router.navigate(['category-chart']).then()
  }

}
