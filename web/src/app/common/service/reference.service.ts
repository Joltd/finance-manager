import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Reference} from "../model/reference";
import {TypeUtils} from "./type-utils";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ReferenceService {

  constructor(private http: HttpClient) {}

  list(api: string): Observable<Reference[]> {
    if (!api) {
      throw 'API URL is not specified'
    }
    return this.http.get<Reference[]>(api, TypeUtils.of(Reference))
      .pipe(map(result => result.sort((a,b) => a.name.localeCompare(b.name))))
  }

}
