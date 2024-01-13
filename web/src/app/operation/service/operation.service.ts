import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {FormControl, FormGroup} from "@angular/forms";
import {Operation, OperationPage} from "../model/operation";
import {Observable} from "rxjs";
import {Router} from "@angular/router";
import * as moment from "moment";
import { EntityFilterExpression, EntityFilterNode, EntityPage } from "../../entity/model/entity";

@Injectable({
  providedIn: 'root'
})
export class OperationService {

  filter!: EntityFilterNode
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

  viewOperations(filter: EntityFilterNode) {
    this.filter = filter
    this.operationPage.page = 0
    this.router.navigate(['operation']).then()
  }

  list() {
    let filter = {
      page: this.operationPage.page,
      size: this.operationPage.size,
      filter: this.filter,
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

}
