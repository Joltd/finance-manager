import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import { Operation, OperationFilter } from "../model/operation";
import {Observable} from "rxjs";
import {Router} from "@angular/router";
import * as moment from "moment";
import { and, EntityFilterNode, EntityPage, expression, or } from "../../entity/model/entity";

@Injectable({
  providedIn: 'root'
})
export class OperationService {

  filter: OperationFilter = {
    dateFrom: null,
    dateTo: null,
    type: null,
    account: null,
    currency: null,
  }
  operationPage: EntityPage = {
    total: 0,
    page: 0,
    size: 20,
    values: []
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  viewOperations(filter: any) {
    this.filter = filter
    this.operationPage.page = 0
    this.router.navigate(['operation']).then()
  }

  list() {
    let filter = {
      page: this.operationPage.page,
      size: this.operationPage.size,
      filter: this.convertToEntityFilter(this.filter),
      sort: [{field: 'date', direction: 'DESC'}]
    }
    this.http.post<EntityPage>('/entity/Operation/list', filter)
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

  private convertToEntityFilter(filter: OperationFilter): EntityFilterNode {
    let conditions: EntityFilterNode[] = []
    if (filter.dateFrom) {
      conditions.push(expression('date', 'GREATER_EQUALS', filter.dateFrom))
    }
    if (filter.dateTo) {
      conditions.push(expression('date', 'LESS', filter.dateTo))
    }
    if (filter.type) {
      conditions.push(or([
        expression('accountFrom.type', 'IN_LIST', [filter.type]),
        expression('accountTo.type', 'IN_LIST', [filter.type])
      ]))
    }
    if (filter.account) {
      conditions.push(or([
        expression('accountFrom', 'IN_LIST', [filter.account]),
        expression('accountTo', 'IN_LIST', [filter.account])
      ]))
    }
    if (filter.currency) {
      conditions.push(or([
        expression('amountFrom.currency', 'IN_LIST', [filter.currency]),
        expression('amountTo.currency', 'IN_LIST', [filter.currency])
      ]))
    }
    return and(conditions)
  }

}
