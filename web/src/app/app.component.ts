import {Component, OnInit} from '@angular/core';
import {LoadingService} from "./common/service/loading.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {SettingsService} from "./settings/service/settings.service";
import {ToolbarService} from "./common/service/toolbar.service";
import {CurrencyService} from "./reference/service/currency.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  loading: boolean = false
  wide: boolean = false

  constructor(
    public loadingService: LoadingService,
    private breakpointObserver: BreakpointObserver,
    private settingsService: SettingsService,
    public toolbarService: ToolbarService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.loadingService.onLoading.subscribe(result => {
      setTimeout(() => this.loading = result)
    })
    this.breakpointObserver.observe(['(min-width: 40em)'])
      .subscribe(state => this.wide = state.matches)
    this.settingsService.load().subscribe()
    this.currencyService.load()
  }

  isWideMenu(): boolean {
    return this.wide
  }

  isWideScreen(): boolean {
    return this.settingsService.wideScreenToggle && this.wide
  }


}

