import {Injectable} from "@angular/core";
import {EMPTY, Observable} from "rxjs";
import {ImportData, ImportDataEntry, ImportDataEntryPage} from "../model/import-data";
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

  entryUpdate(id: string, entryId: string, request: any): Observable<void> {
    return this.httpClient.patch<void>(`/import-data/${id}/entry/${entryId}`, request)
  }

  entryUpdateSimilar(id: string, entryId: string): Observable<void> {
    return this.httpClient.patch<void>(`/import-data/${id}/entry/${entryId}/similar`, null)
  }

  byId(id: string): Observable<ImportData> {
    return this.httpClient.get<ImportData>(`/import-data/${id}`)
  }

  byIdEntry(id: string, entryId: string): Observable<ImportDataEntry> {
      return this.httpClient.get<ImportDataEntry>(`/import-data/${id}/entry/${entryId}`)
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

  preparationRepeat(id: string, entryId: string | null): Observable<void> {
    if (entryId == null) {
      return this.httpClient.put<void>(`/import-data/${id}/preparation`, null)
    } else {
      return this.httpClient.put<void>(`/import-data/${id}/preparation/${entryId}`, null)
    }
  }

  importStart(id: string): Observable<void> {
    return this.httpClient.post<void>(`/import-data/${id}/import`, null)
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
