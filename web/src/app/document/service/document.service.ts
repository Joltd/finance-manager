import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Document} from "../model/document";
import {TypeUtils} from "../../common/service/type-utils";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private http: HttpClient) {}

  list(): Observable<Document[]> {
    return this.http.get<Document[]>('/document', TypeUtils.of(Document))
  }

}
