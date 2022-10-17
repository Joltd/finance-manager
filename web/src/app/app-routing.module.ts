import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ImportDataBrowserComponent} from "./import-data/component/import-data-browser/import-data-browser.component";
import {ImportDataViewComponent} from "./import-data/component/import-data-view/import-data-view.component";
import {ImportDataBeginComponent} from "./import-data/component/import-data-begin/import-data-begin.component";

const routes: Routes = [
  { path: 'import-data', component: ImportDataBrowserComponent },
  { path: 'import-data/new', component: ImportDataBeginComponent },
  { path: 'import-data/:id', component: ImportDataViewComponent },
  { path: '', redirectTo: '/import-data', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
