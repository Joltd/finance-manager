import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Endpoint, Reference} from "../model/reference";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ReferenceService {

  constructor(private http: HttpClient) {}

  list(endpoint: Endpoint): Observable<Reference[]> {
    if (!endpoint) {
      throw 'API URL is not specified'
    }

    return this.http.get<Reference[]>(endpoint.url, {params: endpoint.queryParams})
  }

}
