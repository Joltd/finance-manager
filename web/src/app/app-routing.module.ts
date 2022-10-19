import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ImportDataBrowserComponent} from "./import-data/component/import-data-browser/import-data-browser.component";
import {ImportDataViewComponent} from "./import-data/component/import-data-view/import-data-view.component";
import {ImportDataBeginComponent} from "./import-data/component/import-data-begin/import-data-begin.component";
import {
  DocumentExpenseComponent
} from "./document/component/document-expense/document-expense.component";
import {DocumentBrowserComponent} from "./document/component/document-browser/document-browser.component";

const routes: Routes = [
  { path: 'document', component: DocumentBrowserComponent },
  { path: 'document/expense/:id', component: DocumentExpenseComponent },
  { path: 'import-data', component: ImportDataBrowserComponent },
  { path: 'import-data/new', component: ImportDataBeginComponent },
  { path: 'import-data/:id', component: ImportDataViewComponent },
  { path: '', redirectTo: '/document', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
