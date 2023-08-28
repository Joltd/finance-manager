import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ApplicationSettings} from "../model/application-settings";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  settings!: ApplicationSettings

  constructor(private http: HttpClient) {}

  load() {
    this.http.get<ApplicationSettings>('/setting')
      .subscribe(result => this.settings = result)
  }

  update(settings: any): Observable<void> {
    return this.http.post<void>('/setting', settings)
  }

}
