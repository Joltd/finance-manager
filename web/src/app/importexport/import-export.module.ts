import {NgModule} from "@angular/core";
import {CategoryMappingBrowserComponent} from "./component/category-mapping-browser/category-mapping-browser.component";
import {CategoryMappingEditorComponent} from "./component/category-mapping-editor/category-mapping-editor.component";
import {CategoryMappingLabelComponent} from "./component/category-mapping-label/category-mapping-label.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {PortalModule} from "@angular/cdk/portal";
import {OperationModule} from "../operation/operation.modules";
import {CategoryMappingViewComponent} from "./component/category-mapping-view/category-mapping-view.component";
import {
  CategoryMappingEditorDialogComponent
} from "./component/category-mapping-editor-dialog/category-mapping-editor-dialog.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatTabsModule} from "@angular/material/tabs";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";

@NgModule({
  declarations: [
    CategoryMappingBrowserComponent,
    CategoryMappingViewComponent,
    CategoryMappingEditorComponent,
    CategoryMappingEditorDialogComponent,
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
        NgClass,
        MatProgressSpinnerModule,
        PortalModule,
        OperationModule,
        MatDialogModule,
        MatTabsModule,
        MatSelectModule,
        MatButtonToggleModule,
        FormsModule,
        MatTooltipModule,
        MatSlideToggleModule
    ],
  providers: [],
  exports: [
    CategoryMappingBrowserComponent,
    CategoryMappingViewComponent,
    CategoryMappingEditorComponent,
    CategoryMappingEditorDialogComponent,
    CategoryMappingLabelComponent,
    ImportDataBrowserComponent,
    ImportDataViewComponent,
    ImportDataStartComponent
  ]
})
export class ImportExportModule {}
