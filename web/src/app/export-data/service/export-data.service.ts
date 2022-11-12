import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ExportDataResult} from "../model/export-data-result";

@Injectable({
  providedIn: 'root'
})
export class ExportDataService {

  constructor(
    private http: HttpClient
  ) {}

  exportData(account: string): Observable<Blob> {
    return account
      ? this.http.get('/export-data', {
        params: {account},
        responseType: 'blob'
      })
      : this.http.get('/export-data', {
        responseType: 'blob'
      })
  }

}
