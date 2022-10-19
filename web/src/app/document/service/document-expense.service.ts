import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {DocumentExpense} from "../model/document-expense";
import {HttpClient} from "@angular/common/http";
import {TypeUtils} from "../../common/service/type-utils";

@Injectable({
  providedIn: 'root'
})
export class DocumentExpenseService {

  constructor(private http: HttpClient) {}

  byId(id: string): Observable<DocumentExpense> {
    return this.http.get<DocumentExpense>('/document/expense/' + id, TypeUtils.of(DocumentExpense))
  }

  update(document: DocumentExpense): Observable<void> {
    return this.http.post<void>('/document/expense', document)
  }

}
