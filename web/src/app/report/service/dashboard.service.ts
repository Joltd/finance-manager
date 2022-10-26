import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Dashboard} from "../model/dashboard";
import {Observable} from "rxjs";
import {TypeUtils} from "../../common/service/type-utils";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) {}

  load(): Observable<Dashboard> {
    return this.http.get<Dashboard>('/dashboard', TypeUtils.of(Dashboard))
  }

}
