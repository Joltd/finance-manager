import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {HttpClientModule} from "@angular/common/http";
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule} from "@angular/material/snack-bar";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {restInterceptorProvider} from "./common/service/rest-interceptor.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {CommonModule} from "./common/common.module";
import {MatCardModule} from "@angular/material/card";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MAT_DATE_LOCALE} from "@angular/material/core";
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule} from "@angular/material-moment-adapter";
import {ReferenceModule} from "./reference/reference.module";
import {MatBadgeModule} from "@angular/material/badge";
import {ReportModule} from "./report/report.module";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {ExchangeRateModule} from "./exchangerate/exchange-rate.module";
import {SettingsModule} from "./settings/settings.module";
import {OperationModule} from "./operation/operation.modules";
import {ImportExportModule} from "./importexport/import-export.module";
import { EntityModule } from "./entity/entity.module";
import { CandyModule } from "./candy/candy.module";
import { PricingModule } from "./pricing/pricing.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    MatFormFieldModule,
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatMomentDateModule,
    ReferenceModule,
    MatBadgeModule,
    ReportModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    ExchangeRateModule,
    SettingsModule,
    OperationModule,
    ImportExportModule,
    EntityModule,
    CandyModule,
    PricingModule,
  ],
  providers: [
    restInterceptorProvider,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 3000}},
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
