import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, tap} from "rxjs";
import {ApplicationSettings} from "../model/application-settings";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  settings!: ApplicationSettings
  wideScreenToggle: boolean = true

  constructor(private http: HttpClient) {}

  load(): Observable<ApplicationSettings> {
    return this.http.get<ApplicationSettings>('/setting')
      .pipe(tap(result => this.settings = result))
  }

  update(settings: any): Observable<void> {
    return this.http.post<void>('/setting', settings)
  }

}
