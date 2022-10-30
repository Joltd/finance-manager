import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Account} from "../module/account";
import {TypeUtils} from "../../common/service/type-utils";

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

}
