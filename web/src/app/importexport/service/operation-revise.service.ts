import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {OperationRevise, OperationReviseDate, OperationReviseEntry} from "../model/operation-revise";
import {Operation} from "../../operation/model/operation";

@Injectable({
  providedIn: 'root'
})
export class OperationReviseService {

  constructor(private http: HttpClient) {}

  list(): Observable<OperationRevise[]> {
    return this.http.get<OperationRevise[]>('/operation-revise')
  }

  entryList(id: string, filter: any): Observable<OperationReviseEntry[]> {
    return this.http.post<OperationReviseEntry[]>(`/operation-revise/${id}/entry`, filter)
  }

  byId(id: string): Observable<OperationRevise> {
    return this.http.get<OperationRevise>(`/operation-revise/${id}`)
  }

  updateDate(id: string, date: OperationReviseDate): Observable<void> {
      return this.http.patch<void>(`/operation-revise/${id}/date`, date)
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`/operation-revise/${id}`)
  }

  newRevise(record: any, file: any): Observable<void> {
    let formData = new FormData()
    formData.append('record', JSON.stringify(record))
    formData.append('file', file)
    return this.http.post<void>(`/operation-revise`, formData)
  }

  repeatRevise(id: string): Observable<void> {
    return this.http.patch<void>(`/operation-revise/${id}`, null)
  }

}
