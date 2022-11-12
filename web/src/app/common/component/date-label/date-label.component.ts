import {Component, Input} from "@angular/core";
import * as moment from "moment";

@Component({
  selector: 'date-label',
  templateUrl: 'date-label.component.html',
  styleUrls: ['date-label.component.scss']
})
export class DateLabelComponent {

  day!: string
  month!: string
  year!: string

  @Input()
  set date(date: string) {
    let momentDate = moment(date)
    this.year = momentDate.format("yyyy")
    this.month = momentDate.format("MMM").toUpperCase()
    this.day = momentDate.format("DD")
  }

}
