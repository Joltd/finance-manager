import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Account} from "../model/account";
import {TypeUtils} from "../../common/service/type-utils";
import {Usage} from "../model/usage";

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) {}

  list(): Observable<Account[]> {
    return this.http.get<Account[]>('/account', TypeUtils.of(Account))
  }

  byId(id: string): Observable<Account> {
    return this.http.get<Account>('/account/' + id, TypeUtils.of(Account))
  }

  update(accountCategory: Account): Observable<void> {
    return this.http.post<void>('/account', accountCategory)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/account/' + id)
  }

  usage(id: string): Observable<Usage> {
    return this.http.get<Usage>('/transaction/usage/expense/' + id)
  }

  deleteDocuments(id: string): Observable<void> {
    return this.http.delete<void>(`/account/${id}/document`)
  }

}
