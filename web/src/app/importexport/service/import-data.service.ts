import {Injectable} from "@angular/core";
import {EMPTY, Observable} from "rxjs";
import {ImportData, ImportDataEntryPage} from "../model/import-data";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ImportDataService {

  constructor(private httpClient: HttpClient) {}

  list(): Observable<ImportData[]> {
    return this.httpClient.get<ImportData[]>('/import-data')
  }

  entryList(id: string, filter: any): Observable<ImportDataEntryPage> {
    return this.httpClient.post<ImportDataEntryPage>(`/import-data/${id}/entry`, filter)
  }

  byId(id: string): Observable<ImportData> {
    return this.httpClient.get<ImportData>(`/import-data/${id}`)
  }

  delete(id: string): Observable<void> {
    return this.httpClient.delete<void>(`/import-data/${id}`)
  }

  preparationStart(request: any): Observable<void> {
    let formData = new FormData()
    formData.append('parser', request.parser)
    formData.append('account', request.account)
    formData.append('file', request.file)
    return this.httpClient.post<void>('/import-data', formData)
  }

  preparationRepeat(id: string): Observable<void> {
    return this.httpClient.put<void>('/import-data/{id}/preparation', null)
  }

  cancel(importData: ImportData): Observable<void> {
    if (importData.status == 'PREPARE_IN_PROGRESS') {
      return this.httpClient.delete<void>(`/import-data/${importData.id}/preparation`)
    } else if (importData.status == 'IMPORT_IN_PROGRESS') {
      return this.httpClient.delete<void>(`/import-data/${importData.id}/import`)
    } else {
      return EMPTY
    }
  }

}
