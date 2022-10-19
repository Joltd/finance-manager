import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {TypeUtils} from "../../common/service/type-utils";
import {DocumentIncome} from "../model/document-income";

@Injectable({
  providedIn: 'root'
})
export class DocumentIncomeService {

  constructor(private http: HttpClient) {}

  byId(id: string): Observable<DocumentIncome> {
    return this.http.get<DocumentIncome>('/document/income/' + id, TypeUtils.of(DocumentIncome))
  }

  update(document: DocumentIncome): Observable<void> {
    return this.http.post<void>('/document/income', document)
  }

}
