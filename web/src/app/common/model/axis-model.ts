export class AxisModel {

  private min: number = 0
  private max: number = 0
  private range: number = 0

  define(values: number[]) {
    this.min = Math.min(...values, 0)
    this.max = Math.max(...values)
    this.range = this.max - this.min
  }

  calcOffset(value: number): number {
    let adjustedValue = this.adjustValue(value)
    return (Math.min(adjustedValue,0) - this.min) / this.range * 100
  }

  calcWidth(value: number): number {
    let adjustedValue = this.adjustValue(value)
    return Math.abs(adjustedValue) / this.range * 100
  }

  calcValueOffset(value: number): number {
    let left = this.calcOffset(value)
    let right = left + this.calcWidth(value)

    return [
      { size: left, offset: 0 },
      { size: right - left, offset: left },
      { size: 100 - right, offset: right },
    ].sort((a, b) => b.size - a.size)
      [0].offset
  }

  private adjustValue(value: number): number {
    let adjustedValue = Math.max(this.range * .05, value)
    return value < 0 ? -adjustedValue : adjustedValue
  }

}
