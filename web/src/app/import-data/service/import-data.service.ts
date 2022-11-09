import {Injectable} from "@angular/core";
import {DocumentEntry, ImportData, ImportDataFileResponse, ImportDataResult} from "../model/import-data";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {TypeUtils} from "../../common/service/type-utils";
import {Document} from "../../document/model/document";
import {DocumentTyped} from "../../document/model/document-typed";

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

  reCreate(id: string): Observable<void> {
    return this.http.post<void>('/import-data/' + id, null)
  }

  updateDocumentEntry(id: string, entry: DocumentEntry): Observable<void> {
    return this.http.patch<void>('/import-data/' + id, entry)
  }

  performImport(document: DocumentTyped): Observable<ImportDataResult> {
    return this.http.patch<ImportDataResult>('/import-data', document, TypeUtils.of(ImportDataResult))
  }

  instantImport(importData: ImportData): Observable<ImportDataResult> {
    return this.http.post<ImportDataResult>('/import-data/instant', importData, TypeUtils.of(ImportDataResult))
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/import-data/' + id)
  }

}
