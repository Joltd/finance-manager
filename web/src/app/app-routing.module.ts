import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ImportDataBrowserComponent} from "./import-data/component/import-data-browser/import-data-browser.component";
import {ImportDataViewComponent} from "./import-data/component/import-data-view/import-data-view.component";
import {ImportDataBeginComponent} from "./import-data/component/import-data-begin/import-data-begin.component";
import {DocumentBrowserComponent} from "./document/component/document-browser/document-browser.component";
import {DocumentEditorComponent} from "./document/component/document-editor/document-editor.component";
import {DashboardComponent} from "./report/component/dashboard/dashboard.component";

const routes: Routes = [
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
