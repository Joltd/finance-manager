import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Settings} from "../model/settings";
import {TypeUtils} from "../../common/service/type-utils";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  settings: Settings = new Settings()

  constructor(private http: HttpClient) {
    this.http.get<Settings>('/settings', TypeUtils.of(Settings))
      .subscribe(result => this.settings = result)
  }

}
