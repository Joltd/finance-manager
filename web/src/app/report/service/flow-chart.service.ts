import {Injectable} from "@angular/core";
import * as moment from "moment";
import {HttpClient} from "@angular/common/http";
import {FlowChart} from "../model/flow-chart";
import {TypeUtils} from "../../common/service/type-utils";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FlowChartService {

  dateFrom = moment().subtract(6, 'month').format('yyyy-MM-DD')
  dateTo = moment().format('yyyy-MM-DD')
  groupBy = 'month'
  expenseCategories: string[] = []
  incomeCategories: string[] = []
  currency = 'RUB'

  constructor(private http: HttpClient) {}

  load(value: any): Observable<FlowChart> {
    return this.http.post<FlowChart>('/flow-chart', value, TypeUtils.of(FlowChart))
  }

}
