import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ImportDataBrowserComponent} from "./import-data/component/import-data-browser/import-data-browser.component";
import {ImportDataViewComponent} from "./import-data/component/import-data-view/import-data-view.component";
import {ImportDataBeginComponent} from "./import-data/component/import-data-begin/import-data-begin.component";
import {DocumentBrowserComponent} from "./document/component/document-browser/document-browser.component";
import {DocumentEditorComponent} from "./document/component/document-editor/document-editor.component";
import {DashboardComponent} from "./report/component/dashboard/dashboard.component";
import {ExpenseCategoryBrowserComponent} from "./reference/component/expense-category-browser/expense-category-browser.component";
import {ExpenseCategoryEditorComponent} from "./reference/component/expense-category-editor/expense-category-editor.component";
import {AccountEditorComponent} from "./reference/component/account-editor/account-editor.component";
import {AccountBrowserComponent} from "./reference/component/account-browser/account-browser.component";
import {IncomeCategoryBrowserComponent} from "./reference/component/income-category-browser/income-category-browser.component";
import {IncomeCategoryEditorComponent} from "./reference/component/income-category-editor/income-category-editor.component";

const routes: Routes = [
  { path: 'account', component: AccountBrowserComponent },
  { path: 'account/:id', component: AccountEditorComponent },
  { path: 'expense', component: ExpenseCategoryBrowserComponent },
  { path: 'expense/:id', component: ExpenseCategoryEditorComponent },
  { path: 'income', component: IncomeCategoryBrowserComponent },
  { path: 'income/:id', component: IncomeCategoryEditorComponent },
  { path: 'document', component: DocumentBrowserComponent },
  { path: 'document/:id', component: DocumentEditorComponent },
  { path: 'import-data', component: ImportDataBrowserComponent },
  { path: 'import-data/new', component: ImportDataBeginComponent },
  { path: 'import-data/:id', component: ImportDataViewComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
