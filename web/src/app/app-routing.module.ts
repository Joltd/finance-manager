import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from "./report/component/dashboard/dashboard.component";
import {AccountEditorComponent} from "./reference/component/account-editor/account-editor.component";
import {AccountBrowserComponent} from "./reference/component/account-browser/account-browser.component";
import {ExchangeRateBrowserComponent} from "./exchangerate/component/exchange-rate-browser/exchange-rate-browser.component";
import {ExchangeRateEditorComponent} from "./exchangerate/component/exchange-rate-editor/exchange-rate-editor.component";
import {FlowChartComponent} from "./report/component/flow-chart/flow-chart.component";
import {SettingsEditorComponent} from "./settings/component/settings-editor.component";
import {OperationBrowserComponent} from "./operation/component/operation-browser/operation-browser.component";
import {OperationEditorComponent} from "./operation/component/operation-editor/operation-editor.component";
import {CurrentFundsChartComponent} from "./report/component/current-fund-chart/current-funds-chart.component";
import {
  CumulativeFundsChartComponent
} from "./report/component/cumulative-funds-chart/cumulative-funds-chart.component";

const routes: Routes = [
  { path: 'account', component: AccountBrowserComponent },
  { path: 'account/:id', component: AccountEditorComponent },
  { path: 'operation', component: OperationBrowserComponent },
  { path: 'operation/:id', component: OperationEditorComponent },
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
