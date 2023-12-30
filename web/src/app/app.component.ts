import {Component, OnInit} from '@angular/core';
import {LoadingService} from "./common/service/loading.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {SettingsService} from "./settings/service/settings.service";
import {ToolbarService} from "./common/service/toolbar.service";
import {CurrencyService} from "./reference/service/currency.service";
import {lastValueFrom} from "rxjs";
import { AdaptiveService } from "./common/service/adaptive.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  loading: boolean = false

  constructor(
    public adaptiveService: AdaptiveService,
    private loadingService: LoadingService,
    public settingsService: SettingsService,
    public toolbarService: ToolbarService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.loadingService.onLoading.subscribe(result => {
      setTimeout(() => this.loading = result)
    })
    // lastValueFrom(this.settingsService.load()).then()
    // lastValueFrom(this.currencyService.load()).then()
  }

}

