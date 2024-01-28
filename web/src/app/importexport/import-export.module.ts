import {NgModule} from "@angular/core";
import {CategoryMappingLabelComponent} from "./component/category-mapping-label/category-mapping-label.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {CommonModule} from "../common/common.module";
import {ReferenceModule} from "../reference/reference.module";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatCardModule} from "@angular/material/card";
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
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
import {
  CategoryMappingEditorDialogComponent
} from "./component/category-mapping-editor-dialog/category-mapping-editor-dialog.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatTabsModule} from "@angular/material/tabs";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {ImportDataParsedEntryComponent} from "./component/import-data-parsed-entry/import-data-parsed-entry.component";
import {OperationReviseViewComponent} from "./component/operation-revise-view/operation-revise-view.component";
import {OperationModule} from "../operation/operation.modules";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {OperationReviseBrowserComponent} from "./component/operation-revise-browser/operation-revise-browser.component";
import {MatRippleModule} from "@angular/material/core";
import {
  ImportDataParsedEntryDialogComponent
} from "./component/import-data-parsed-entry-dialog/import-data-parsed-entry-dialog.component";
import {MatProgressBarModule} from "@angular/material/progress-bar";

@NgModule({
  declarations: [
    CategoryMappingEditorDialogComponent,
    CategoryMappingLabelComponent,
    ImportDataBrowserComponent,
    ImportDataViewComponent,
    ImportDataStartComponent,
    ImportDataParsedEntryComponent,
    ImportDataParsedEntryDialogComponent,
    OperationReviseBrowserComponent,
    OperationReviseViewComponent
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
        MatDialogModule,
        MatTabsModule,
        MatSelectModule,
        MatButtonToggleModule,
        FormsModule,
        MatTooltipModule,
        MatSlideToggleModule,
        NgStyle,
        OperationModule,
        MatDatepickerModule,
        MatRippleModule,
        MatProgressBarModule
    ],
  providers: [],
  exports: [
    CategoryMappingEditorDialogComponent,
    CategoryMappingLabelComponent,
    ImportDataBrowserComponent,
    ImportDataViewComponent,
    ImportDataStartComponent,
    ImportDataParsedEntryComponent,
    ImportDataParsedEntryDialogComponent,
    OperationReviseBrowserComponent,
    OperationReviseViewComponent
  ]
})
export class ImportExportModule {}
