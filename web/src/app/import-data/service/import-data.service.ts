import {Injectable} from "@angular/core";
import {ImportData, ImportDataFileResponse} from "../model/import-data";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {TypeUtils} from "../../common/service/type-utils";
import {ImportDataEntry} from "../model/import-data-entry";

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

  uploadFile(file: File): Observable<ImportDataFileResponse> {
    let formData = new FormData()
    formData.append('file', file)
    return this.http.post<ImportDataFileResponse>('/import-data/file', formData, TypeUtils.of(ImportDataFileResponse))
  }

  create(importData: ImportData): Observable<void> {
    return this.http.post<void>('/import-data', importData)
  }

  performImport(account: string, entries: ImportDataEntry[]): Observable<void> {
    let importData = new ImportData()
    importData.account = account
    importData.entries = entries
    return this.http.patch<void>('/import-data', importData)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/import-data/' + id)
  }

}
