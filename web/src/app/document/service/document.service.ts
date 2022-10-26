import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DocumentRow} from "../model/document-row";
import {TypeUtils} from "../../common/service/type-utils";
import {map} from "rxjs/operators";
import {DocumentTyped} from "../model/document-typed";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private http: HttpClient) {}

  list(): Observable<DocumentTyped[]> {
    return this.http.get<DocumentTyped[]>('/document', TypeUtils.of(DocumentTyped))
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
