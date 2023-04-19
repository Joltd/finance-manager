import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {ECharts} from "echarts";
import * as echarts from "echarts";
import {FlowGraphChartService} from "../../service/flow-graph-chart.service";
import {FormGroup} from "@angular/forms";
import {Amount, formatAsString} from "../../../common/model/amount";
import {FlowGraphChartLink, FlowGraphChartNode} from "../../model/flow-graph-chart";

@Component({
  selector: 'flow-graph-chart',
  templateUrl: 'flow-graph-chart.component.html',
  styleUrls: ['flow-graph-chart.component.scss']
})
export class FlowGraphChartComponent implements AfterViewInit, OnDestroy {

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts

  constructor(
    private flowGraphChartService: FlowGraphChartService
  ) {
  }

  ngAfterViewInit(): void {
    let chart = echarts.init(this.chartContainer.nativeElement)
    window.onresize = function () {
      chart.resize()
    }
    this.chart = chart
    this.flowGraphChartService.onLoad.subscribe(() => this.refreshChart())
    this.flowGraphChartService.load()
  }

  ngOnDestroy(): void {
    this.chart.dispose()
  }

  filter(): FormGroup {
    return this.flowGraphChartService.settings
  }

  private refreshChart() {
    let option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: {
        type: 'sankey',
        layout: 'none',
        left: 'center',
        width: '80%',
        layoutIterations: 0,
        draggable: false,
        emphasis: {
          focus: 'adjacency'
        },
        levels: [
          {depth: 0},
          {depth: 1},
          {depth: 2},
          {depth: 3},
        ],
        data: this.prepareNodes(),
        links: this.prepareLinks()
      },
      dataZoom: {
        type: 'inside',
        orient: 'vertical'
      }
    }
    this.chart.resize()
    this.chart.clear()
    this.chart.setOption(option)
  }

  private prepareNodes(): any[] {
    return this.flowGraphChartService.data.nodes.map(node => {
      return {
        name: node.id,
        depth: this.determineDepth(node),
        itemStyle: {
          color: this.determineColor(node)
        },
        label: {
          show: false
        },
        tooltip: {
          formatter: `${node.date}<br/>${formatAsString(node.amount)}`
        }
      }
    })
  }

  private prepareLinks(): any[] {
    let max = this.maxValue(this.flowGraphChartService.data.links)
    let min = this.minValue(this.flowGraphChartService.data.links)

    return this.flowGraphChartService.data.links.map(link => {
      return {
        source: link.source,
        target: link.target,
        value: link.amount != null ? this.mapValue(min, max, 10, 40, link.amount.value) : 10, // for exchange value should be the same
        tooltip: {
          formatter: link.amount != null ? `${formatAsString(link.amount)}` : `Exchange`
        }
      }
    })
  }

  private determineDepth(node: FlowGraphChartNode): number {
    if (node.outside && node.direction == 'OUT') return 0
    if (!node.outside && node.direction == 'IN') return 1
    if (!node.outside && node.direction == 'OUT') return 2
    if (node.outside && node.direction == 'IN') return 3
    throw new Error('Unknown node state')
  }

  private determineColor(node: FlowGraphChartNode): string {
    if (!node.outside && node.direction == 'IN') return '#66bb6a'
    if (!node.outside && node.direction == 'OUT') return '#ef5350'
    return '#1e88e5'
  }

  private mapValue(minFrom: number, maxFrom: number, minTo: number, maxTo: number, value: number): number {
    return minTo + (maxTo - minTo) * (value - minFrom) / (maxFrom - minFrom)
  }

  private minValue(links: FlowGraphChartLink[]): number {
    if (links.length == 0) return 0
    if (links.length == 1) return links[0].amount?.value || 0
    return links.map(link => link.amount?.value || 0).reduce((a, b) => Math.min(a, b))
  }

  private maxValue(links: FlowGraphChartLink[]): number {
    if (links.length == 0) return 0
    if (links.length == 1) return links[0].amount?.value || 0
    return links.map(link => link.amount?.value || 0).reduce((a, b) => Math.max(a, b))
  }

}
