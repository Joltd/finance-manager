import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DocumentRow} from "../model/document-row";
import {TypeUtils} from "../../common/service/type-utils";
import {DocumentTyped} from "../model/document-typed";
import {FormControl, FormGroup} from "@angular/forms";
import {DocumentPage} from "../model/document-page";
import {ReferenceService} from "../../common/service/reference.service";
import {Total} from "../../report/model/total";
import {DocumentExpense, DocumentIncome} from "../model/document";
import {toFractional} from "../../common/model/amount";
import * as moment from "moment/moment";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  filter: FormGroup = new FormGroup({
    // dateFrom: new FormControl(moment().subtract(6, 'month').format('yyyy-MM-DD')),
    // dateTo: new FormControl(moment().format('yyyy-MM-DD')),
    dateFrom: new FormControl(null),
    dateTo: new FormControl(null),
    type: new FormControl(null),
    expenseCategories: new FormControl([]),
    incomeCategories: new FormControl([]),
    account: new FormControl(null),
    currency: new FormControl(null)
  })
  documentPage: DocumentPage = new DocumentPage()

  constructor(
    private http: HttpClient
  ) {}

  updateFilter(filter: any) {
    let empty = {
      dateFrom: null,
      dateTo: null,
      type: null,
      expenseCategories: [],
      incomeCategories: [],
      account: null,
      currency: null
    }
    this.filter.setValue({...empty, ...filter})
  }

  list() {
    let filter = {...this.filter.value}
    filter.page = this.documentPage.page
    filter.size = this.documentPage.size
    this.http.post<DocumentPage>('/document/filter', filter, TypeUtils.of(DocumentPage))
      .subscribe(result => this.documentPage = result)
  }

  byId(id: string): Observable<DocumentTyped> {
    return this.http.get<DocumentTyped>('/document/' + id, TypeUtils.of(DocumentTyped))
  }

  update(document: DocumentTyped): Observable<void> {
    return this.http.post<void>('/document', document)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/document/' + id)
  }

}
