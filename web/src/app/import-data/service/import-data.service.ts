import {Injectable} from "@angular/core";
import {ImportData, ImportDataEntryPage} from "../model/import-data";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ImportDataService {

  constructor(private http: HttpClient) {}

  list(): Observable<ImportData[]> {
    return this.http.get<ImportData[]>('/import-data')
  }

  entryList(id: string, request: any): Observable<ImportDataEntryPage> {
    return this.http.post<ImportDataEntryPage>(`/import-data/${id}/entry`, request)
  }

  byId(id: string): Observable<ImportData> {
    return this.http.get<ImportData>('/import-data/' + id)
  }

  entryUpdate(id: string, request: any): Observable<void> {
    return this.http.patch<void>(`/import-data/${id}/entry`, request)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/import-data/' + id)
  }

  startPreparation(beginImport: any): Observable<void> {
    let formData = new FormData()
    formData.append('parser', beginImport.parser)
    formData.append('account', beginImport.account)
    formData.append('file', beginImport.file)
    return this.http.post<void>('/import-data', formData)
  }

  repeatPreparation(id: string): Observable<void> {
    return this.http.patch<void>(`/import-data/${id}/preparation`, null)
  }

  cancelPreparation(id: string): Observable<void> {
    return this.http.delete<void>(`/import-data/${id}/preparation`)
  }

  startImport(id: string): Observable<void> {
    return this.http.post<void>(`/import-data/${id}/import`, null)
  }

  cancelImport(id: string): Observable<void> {
    return this.http.delete<void>(`/import-data/${id}/import`)
  }

}
