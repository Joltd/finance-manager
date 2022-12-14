import {Injectable} from "@angular/core";
import {
  ImportDataFileResponse,
  ImportData, ImportDataEntry, ImportDataEntryForRemove
} from "../model/import-data-old";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {TypeUtils} from "../../common/service/type-utils";

@Injectable({
  providedIn: 'root'
})
export class ImportDataService {

  constructor(private http: HttpClient) {}

  list(): Observable<ImportData[]> {
    return this.http.get<ImportData[]>('/import-data', TypeUtils.of(ImportData))
  }

  byId(id: string): Observable<ImportData> {
    return this.http.get<ImportData>('/import-data/' + id, TypeUtils.of(ImportData))
  }

  entryById(id: string, entryId: string): Observable<ImportDataEntry> {
    return this.http.get<ImportDataEntry>(`/import-data/${id}/entry/${entryId}`, TypeUtils.of(ImportDataEntry))
  }

  forRemove(id: string, entryId: string): Observable<ImportDataEntryForRemove> {
    return this.http.get<ImportDataEntryForRemove>(`/import-data/${id}/entry/${entryId}/for-remove`, TypeUtils.of(ImportDataEntryForRemove))
  }

  entryUpdate(id: string, entryId: string, entry: ImportDataEntry): Observable<void> {
    return this.http.patch<void>(`/import-data/${id}/entry/${entryId}`, entry)
  }

  forRemoveUpdate(id: string, entryId: string, forRemove: ImportDataEntryForRemove): Observable<void> {
    return this.http.patch<void>(`/import-data/${id}/entry/${entryId}/for-remove`, forRemove)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/import-data/' + id)
  }

  performImport(id: string): Observable<void> {
    return this.http.post<void>('/import-data/' + id, null)
  }

  //

  uploadFile(file: File): Observable<ImportDataFileResponse> {
    let formData = new FormData()
    formData.append('file', file)
    return this.http.post<ImportDataFileResponse>('/import-data/file', formData, TypeUtils.of(ImportDataFileResponse))
  }

  create(importData: ImportData): Observable<void> {
    return this.http.post<void>('/import-data', importData)
  }

}
