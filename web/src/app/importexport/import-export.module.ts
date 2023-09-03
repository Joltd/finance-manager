import {NgModule} from "@angular/core";
import {CategoryMappingBrowserComponent} from "./component/category-mapping-browser/category-mapping-browser.component";
import {CategoryMappingEditorComponent} from "./component/category-mapping-editor/category-mapping-editor.component";
import {CategoryMappingLabelComponent} from "./component/category-mapping-label/category-mapping-label.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {CommonModule} from "../common/common.module";
import {ReferenceModule} from "../reference/reference.module";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatCardModule} from "@angular/material/card";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {ImportDataBrowserComponent} from "./component/import-data-browser/import-data-browser.component";
import {ImportDataViewComponent} from "./component/import-data-view/import-data-view.component";
import {ImportDataStartComponent} from "./component/import-data-start/import-data-start.component";

@NgModule({
  declarations: [
    CategoryMappingBrowserComponent,
    CategoryMappingEditorComponent,
    CategoryMappingLabelComponent,
    ImportDataBrowserComponent,
    ImportDataViewComponent,
    ImportDataStartComponent
  ],
  imports: [
    MatExpansionModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CommonModule,
    ReferenceModule,
    MatPaginatorModule,
    MatCardModule,
    NgIf,
    MatListModule,
    NgForOf,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    NgClass
  ],
  providers: [],
  exports: [
    CategoryMappingBrowserComponent,
    CategoryMappingEditorComponent,
    CategoryMappingLabelComponent,
    ImportDataBrowserComponent,
    ImportDataViewComponent,
    ImportDataStartComponent
  ]
})
export class ImportExportModule {}
