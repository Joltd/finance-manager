import {EventEmitter, Injectable} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import * as moment from "moment";
import {HttpClient} from "@angular/common/http";
import {TypeUtils} from "../../common/service/type-utils";
import {CategoryChart} from "../model/category-chart";
import {ReferenceService} from "../../common/service/reference.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CategoryChartService {

  dateFrom = moment().subtract(6, 'month').format('yyyy-MM-DD')
  dateTo = moment().format('yyyy-MM-DD')
  groupBy = 'month'
  expenseCategories: string[] = []
  incomeCategories: string[] = []
  currency = 'RUB'

  constructor(private http: HttpClient,) {}

  load(value: any): Observable<CategoryChart> {
    return this.http.post<CategoryChart>('/category-chart', value, TypeUtils.of(CategoryChart))
  }

}
