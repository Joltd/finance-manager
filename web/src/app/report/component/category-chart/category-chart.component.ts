import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {ECharts} from "echarts";
import {CategoryChartService} from "../../service/category-chart.service";
import * as echarts from "echarts";
import {FormGroup} from "@angular/forms";
import {toFractional} from "../../../common/model/amount";
import {Reference} from "../../../common/model/reference";
import {ReferenceService} from "../../../common/service/reference.service";
import {Total} from "../../model/total";
import {DocumentService} from "../../../document/service/document.service";
import {Router} from "@angular/router";

@Component({
  selector: 'category-chart',
  templateUrl: 'category-chart.component.html',
  styleUrls: ['category-chart.component.scss']
})
export class CategoryChartComponent implements AfterViewInit, OnDestroy {

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts

  expenseCategories: Reference[] = []
  incomeCategories: Reference[] = []

  totals: Total[] = []

  constructor(
    private categoryChartService: CategoryChartService,
    private documentService: DocumentService,
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
    this.categoryChartService.onLoad.subscribe(() => this.refreshChart())
    this.categoryChartService.load()
  }

  ngOnDestroy(): void {
    this.chart.dispose()
  }

  filter(): FormGroup {
    return this.categoryChartService.settings
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
    let amounts = this.categoryChartService.data.amounts;
    let total = amounts
      .map(amount => toFractional(amount))
      .reduce((previous, current) => previous + current, 0)
    this.totals = [{
      category: 'Total',
      amount: Math.floor(total)
    }]
    let option = {
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        // axisLabel: {
        //   rotate: 90
        // },
        data: this.categoryChartService.data.categories.map(reference => reference.name)
      },
      series: [
        {
          name: this.categoryChartService.settings.value.groupBy == 'expense' ? 'Expense' : 'Income',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          label: {
            show: true,
            position: 'right'
          },
          data: amounts.map(amount => Math.floor(toFractional(amount)))
        }
      ],
      grid: {
        left: '2%',
        right: '6%',
        bottom: '2%',
        top: '2%',
        containLabel: true
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        },
        valueFormatter: (value: number) => value
      }
    }
    this.chart.resize()
    this.chart.clear()
    this.chart.setOption(option)
  }

  private drillDown(params: any) {
    let type = this.categoryChartService.settings.value.groupBy;
    this.documentService.updateFilter({
      dateFrom: this.categoryChartService.settings.value.dateFrom,
      dateTo: this.categoryChartService.settings.value.dateTo,
      type: type,
      expenseCategories: type == 'expense' ? [this.categoryChartService.data.categories[params.dataIndex].id] : [],
      incomeCategories: type == 'income' ? [this.categoryChartService.data.categories[params.dataIndex].id] : [],
    })
    this.router.navigate(['document']).then()
  }

}
