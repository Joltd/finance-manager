import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Account} from "../model/account";

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) {}

  list(): Observable<Account[]> {
    return this.http.get<Account[]>('/account')
  }

  byId(id: string): Observable<Account> {
    return this.http.get<Account>('/account/' + id)
  }

  update(account: Account): Observable<void> {
    return this.http.post<void>('/account', account)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/account/' + id)
  }

}
