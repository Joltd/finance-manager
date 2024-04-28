import {NgModule} from "@angular/core";
import {OperationBrowserComponent} from "./component/operation-browser/operation-browser.component";
import {OperationEditorComponent} from "./component/operation-editor/operation-editor.component";
import {OperationLabelComponent} from "./component/operation-label/operation-label.component";
import {CommonModule} from "../common/common.module";
import {NgForOf, NgIf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatExpansionModule} from "@angular/material/expansion";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatCardModule} from "@angular/material/card";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {OperationViewComponent} from "./component/operation-view/operation-view.component";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {ReferenceModule} from "../reference/reference.module";
import {OperationEditorDialogComponent} from "./component/operation-editor-dialog/operation-editor-dialog.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { OperationFilterComponent } from "./component/operation-filter/operation-filter.component";

@NgModule({
  declarations: [
    OperationBrowserComponent,
    OperationEditorComponent,
    OperationViewComponent,
    OperationLabelComponent,
    OperationEditorDialogComponent,
    OperationFilterComponent,
  ],
  imports: [
    CommonModule,
    NgIf,
    MatIconModule,
    MatExpansionModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatCardModule,
    MatListModule,
    MatMenuModule,
    NgForOf,
    MatButtonToggleModule,
    FormsModule,
    ReferenceModule,
    MatDialogModule,
    MatCheckboxModule
  ],
  providers: [],
  exports: [
    OperationBrowserComponent,
    OperationEditorComponent,
    OperationViewComponent,
    OperationLabelComponent,
    OperationEditorDialogComponent,
    OperationFilterComponent,
  ]
})
export class OperationModule {}
