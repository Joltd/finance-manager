import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DocumentRow} from "../model/document-row";
import {TypeUtils} from "../../common/service/type-utils";
import {DocumentTyped} from "../model/document-typed";
import {FormControl, FormGroup} from "@angular/forms";
import {DocumentPage} from "../model/document-page";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  filter: FormGroup = new FormGroup({
    dateFrom: new FormControl(null),
    dateTo: new FormControl(null),
    type: new FormControl(null),
    account: new FormControl(null),
    currency: new FormControl(null)
  })
  documentPage: DocumentPage = new DocumentPage()

  constructor(private http: HttpClient) {}

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
