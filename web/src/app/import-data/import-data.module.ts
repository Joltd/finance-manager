import {NgModule} from "@angular/core";
import {ImportDataViewComponent} from "./component/import-data-view/import-data-view.component";
import {MatCardModule} from "@angular/material/card";
import {MatListModule} from "@angular/material/list";
import {ImportDataStartComponent} from "./component/import-data-begin/import-data-start.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {CommonModule} from "../common/common.module";
import {MatIconModule} from "@angular/material/icon";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ImportDataBrowserComponent} from "./component/import-data-browser/import-data-browser.component";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatInputModule} from "@angular/material/input";
import {DocumentModule} from "../document/document.module";
import {MatLineModule, MatOptionModule, MatRippleModule} from "@angular/material/core";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatPaginatorModule} from "@angular/material/paginator";
import {CategoryMappingBrowserComponent} from "./component/category-mapping-browser/category-mapping-browser.component";
import {MatSelectModule} from "@angular/material/select";
import {CategoryMappingEditorComponent} from "./component/category-mapping-editor/category-mapping-editor.component";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {CategoryMappingLabelComponent} from "./component/category-mapping-label/category-mapping-label.component";
import {CdkDrag} from "@angular/cdk/drag-drop";
import {MatChipsModule} from "@angular/material/chips";
import {PortalModule} from "@angular/cdk/portal";
import {MatTabsModule} from "@angular/material/tabs";

@NgModule({
  declarations: [
    ImportDataViewComponent,
    ImportDataStartComponent,
    ImportDataBrowserComponent,
    CategoryMappingBrowserComponent,
    CategoryMappingEditorComponent,
    CategoryMappingLabelComponent
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
        MatRippleModule,
        FormsModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatDatepickerModule,
        MatExpansionModule,
        MatLineModule,
        MatPaginatorModule,
        MatOptionModule,
        MatSelectModule,
        MatButtonToggleModule,
        NgClass,
        CdkDrag,
        MatChipsModule,
        PortalModule,
        MatTabsModule
    ],
  exports: [
    ImportDataViewComponent,
    ImportDataBrowserComponent
  ]
})
export class ImportDataModule {}
