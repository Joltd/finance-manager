import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from "./report/component/dashboard/dashboard.component";
import {AccountEditorComponent} from "./reference/component/account-editor/account-editor.component";
import {AccountBrowserComponent} from "./reference/component/account-browser/account-browser.component";
import {
  ExchangeRateBrowserComponent
} from "./exchangerate/component/exchange-rate-browser/exchange-rate-browser.component";
import {
  ExchangeRateEditorComponent
} from "./exchangerate/component/exchange-rate-editor/exchange-rate-editor.component";
import {FlowChartComponent} from "./report/component/flow-chart/flow-chart.component";
import {SettingsEditorComponent} from "./settings/component/settings-editor.component";
import {OperationBrowserComponent} from "./operation/component/operation-browser/operation-browser.component";
import {OperationEditorComponent} from "./operation/component/operation-editor/operation-editor.component";
import {CurrentFundsChartComponent} from "./report/component/current-fund-chart/current-funds-chart.component";
import {
  CumulativeFundsChartComponent
} from "./report/component/cumulative-funds-chart/cumulative-funds-chart.component";
import {CurrencyBrowserComponent} from "./reference/component/currency-browser/currency-browser.component";
import {CurrencyEditorComponent} from "./reference/component/currency-editor/currency-editor.component";
import {
  CategoryMappingBrowserComponent
} from "./importexport/component/category-mapping-browser/category-mapping-browser.component";
import {
  CategoryMappingEditorComponent
} from "./importexport/component/category-mapping-editor/category-mapping-editor.component";
import {ImportDataBrowserComponent} from "./importexport/component/import-data-browser/import-data-browser.component";
import {ImportDataViewComponent} from "./importexport/component/import-data-view/import-data-view.component";
import {ImportDataStartComponent} from "./importexport/component/import-data-start/import-data-start.component";
import {
  OperationReviseViewComponent
} from "./importexport/component/operation-revise-view/operation-revise-view.component";
import {
  OperationReviseBrowserComponent
} from "./importexport/component/operation-revise-browser/operation-revise-browser.component";

const routes: Routes = [
  { path: 'currency', component: CurrencyBrowserComponent },
  { path: 'currency/:id', component: CurrencyEditorComponent },
  { path: 'account', component: AccountBrowserComponent },
  { path: 'account/:id', component: AccountEditorComponent },
  { path: 'operation', component: OperationBrowserComponent },
  { path: 'operation/:id', component: OperationEditorComponent },
  { path: 'operation-revise', component: OperationReviseBrowserComponent },
  { path: 'operation-revise/:id', component: OperationReviseViewComponent },
  { path: 'category-mapping', component: CategoryMappingBrowserComponent },
  { path: 'category-mapping/:id', component: CategoryMappingEditorComponent },
  { path: 'import-data', component: ImportDataBrowserComponent },
  { path: 'import-data-start', component: ImportDataStartComponent },
  { path: 'import-data/:id', component: ImportDataViewComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'flow-chart', component: FlowChartComponent },
  { path: 'current-funds-chart', component: CurrentFundsChartComponent },
  { path: 'cumulative-funds-chart', component: CumulativeFundsChartComponent },
  { path: 'exchange-rate', component: ExchangeRateBrowserComponent },
  { path: 'exchange-rate/:id', component: ExchangeRateEditorComponent },
  { path: 'settings', component: SettingsEditorComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
