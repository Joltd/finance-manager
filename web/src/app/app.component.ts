import {Component} from '@angular/core';
import {environment} from "../environments/environment";
import {LoadingService} from "./common/service/loading.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {SettingsService} from "./settings/service/settings.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  version: string = environment.version
  loading: boolean = false
  wide: boolean = false

  constructor(
    public loadingService: LoadingService,
    private breakpointObserver: BreakpointObserver,
    private settingsService: SettingsService
  ) {
    this.loadingService.onLoading.subscribe(result => {
      setTimeout(() => this.loading = result)
    })
    this.breakpointObserver.observe(['(min-width: 40em)'])
      .subscribe(state => this.wide = state.matches)
    this.settingsService.load().subscribe()
  }

}

