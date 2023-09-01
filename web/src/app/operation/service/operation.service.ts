import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {FormControl, FormGroup} from "@angular/forms";
import {Operation, OperationPage} from "../model/operation";
import {Observable} from "rxjs";
import {Router} from "@angular/router";
import * as moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class OperationService {

  filter: FormGroup = new FormGroup({
    dateFrom: new FormControl(moment().subtract(3, 'month').format('yyyy-MM-DD')),
    dateTo: new FormControl(moment().format('yyyy-MM-DD')),
    type: new FormControl(null),
    category: new FormControl(null),
    account: new FormControl(null),
    currency: new FormControl(null),
  })
  operationPage: OperationPage = {
    total: 0,
    page: 0,
    size: 20,
    operations: []
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  viewOperations(filter: any) {
    this.filter.setValue({
      ...{
        dateFrom: null,
        dateTo: null,
        type: null,
        category: null,
        account: null,
        currency: null,
      },
      ...filter
    })
    this.operationPage.page = 0
    this.router.navigate(['operation']).then()
  }

  list() {
    let filter = {
      page: this.operationPage.page,
      size: this.operationPage.size,
      ...this.filter.value
    }
    this.http.post<OperationPage>('/operation/filter', filter)
      .subscribe(result => this.operationPage = result)
  }

  byId(id: string): Observable<Operation> {
    return this.http.get<Operation>('/operation/' + id)
  }

  update(operation: any): Observable<void> {
    return this.http.post<void>('/operation', operation)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/operation/' + id)
  }

}
