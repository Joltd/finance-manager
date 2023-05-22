import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {TypeUtils} from "../../common/service/type-utils";
import {Settings} from "../model/settings";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  settings: Settings = new Settings()

  constructor(private http: HttpClient) {}

  load(): Observable<Settings> {
    return this.http.get<Settings>('/settings', TypeUtils.of(Settings))
      .pipe(map(result => {
        this.settings = result
        return result
      }))
  }

  update(settings: Settings): Observable<void> {
    return this.http.post<void>('/settings', settings)
  }

  clearDatabase(): Observable<void> {
    return this.http.delete<void>('/settings/database')
  }

  handleDocuments(): Observable<void> {
    return this.http.post<void>('/settings/document', null)
  }

}
