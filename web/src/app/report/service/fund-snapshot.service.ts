import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {FundSnapshot} from "../model/fund-snapshor";
import {TypeUtils} from "../../common/service/type-utils";

@Injectable({
  providedIn: 'root'
})
export class FundSnapshotService {

  constructor(private http: HttpClient) {}

  load(): Observable<FundSnapshot[]> {
    return this.http.get<FundSnapshot[]>('/fund-snapshot', TypeUtils.of(FundSnapshot))
  }

  byId(id: string): Observable<FundSnapshot> {
    return this.http.get<FundSnapshot>(`/fund-snapshot/${id}`, TypeUtils.of(FundSnapshot))
  }

}
