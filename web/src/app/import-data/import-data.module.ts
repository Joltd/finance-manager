import {NgModule} from "@angular/core";
import {ImportDataViewComponent} from "./component/import-data-view/import-data-view.component";
import {MatCardModule} from "@angular/material/card";
import {MatListModule} from "@angular/material/list";
import {ImportDataBeginComponent} from "./component/import-data-begin/import-data-begin.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {CommonModule} from "../common/common.module";
import {MatIconModule} from "@angular/material/icon";
import {NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {ImportDataBrowserComponent} from "./component/import-data-browser/import-data-browser.component";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatInputModule} from "@angular/material/input";
import {DocumentModule} from "../document/document.module";
import {MatRippleModule} from "@angular/material/core";

@NgModule({
  declarations: [
    ImportDataViewComponent,
    ImportDataBeginComponent,
    ImportDataBrowserComponent
  ],
  imports: [
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    CommonModule,
    MatIconModule,
    NgIf,
    ReactiveFormsModule,
    MatButtonModule,
    NgForOf,
    MatMenuModule,
    MatCheckboxModule,
    MatInputModule,
    DocumentModule,
    MatRippleModule
  ],
  exports: [
    ImportDataViewComponent,
    ImportDataBrowserComponent
  ]
})
export class ImportDataModule {}
