import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ImportDataBrowserComponent} from "./import-data/component/import-data-browser/import-data-browser.component";
import {ImportDataViewComponent} from "./import-data/component/import-data-view/import-data-view.component";
import {DocumentBrowserComponent} from "./document/component/document-browser/document-browser.component";
import {DocumentEditorComponent} from "./document/component/document-editor/document-editor.component";
import {DashboardComponent} from "./report/component/dashboard/dashboard.component";
import {
  ExpenseCategoryBrowserComponent
} from "./reference/component/expense-category-browser/expense-category-browser.component";
import {
  ExpenseCategoryEditorComponent
} from "./reference/component/expense-category-editor/expense-category-editor.component";
import {AccountEditorComponent} from "./reference/component/account-editor/account-editor.component";
import {AccountBrowserComponent} from "./reference/component/account-browser/account-browser.component";
import {
  IncomeCategoryBrowserComponent
} from "./reference/component/income-category-browser/income-category-browser.component";
import {
  IncomeCategoryEditorComponent
} from "./reference/component/income-category-editor/income-category-editor.component";
import {ExportDataBeginComponent} from "./export-data/component/export-data-begin/export-data-begin.component";
import {
  ExchangeRateBrowserComponent
} from "./exchangerate/component/exchange-rate-browser/exchange-rate-browser.component";
import {
  ExchangeRateEditorComponent
} from "./exchangerate/component/exchange-rate-editor/exchange-rate-editor.component";
import {FlowChartComponent} from "./report/component/flow-chart/flow-chart.component";
import {SettingsEditorComponent} from "./settings/component/settings-editor.component";
import {FastExpenseComponent} from "./document/component/fast-expense/fast-expense.component";
import {
  ImportDataEntryViewComponent
} from "./import-data/component/import-data-entry-view/import-data-entry-view.component";
import {FastExchangeComponent} from "./document/component/fast-exchange/fast-exchange.component";

const routes: Routes = [
  { path: 'account', component: AccountBrowserComponent },
  { path: 'account/:id', component: AccountEditorComponent },
  { path: 'operation', component: OperationBrowserComponent },
  { path: 'operation/:id', component: OperationEditorEcomponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'fast-expense', component: FastExpenseComponent },
  { path: 'fast-exchange', component: FastExchangeComponent },
  { path: 'flow-chart', component: FlowChartComponent },
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
