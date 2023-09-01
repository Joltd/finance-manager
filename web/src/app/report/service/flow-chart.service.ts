import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {FlowChart} from "../model/flow-chart";
import {Observable} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
import * as moment from "moment/moment";

@Injectable({
  providedIn: 'root'
})
export class FlowChartService {

  settings: FormGroup = new FormGroup({
    dateFrom: new FormControl(moment().subtract(3, 'month').format('yyyy-MM-DD')),
    dateTo: new FormControl(moment().format('yyyy-MM-DD')),
    categories: new FormControl([]),
    currency: new FormControl('USD'),
    total: new FormControl(true),
    showAverage: new FormControl(false),
  })

  constructor(private http: HttpClient) {}

  load(): Observable<FlowChart> {
    return this.http.post<FlowChart>('/flow-chart', this.settings.value)
  }

  clearCategories() {
    this.settings.patchValue({
      categories: []
    })
  }

}
