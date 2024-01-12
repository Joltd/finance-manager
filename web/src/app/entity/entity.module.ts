import { NgModule } from "@angular/core";
import { EntityBrowserComponent } from "./component/entity-browser/entity-browser.component";
import { CommonModule } from "../common/common.module";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { EntityListComponent } from "./component/entity-list/entity-list.component";
import { AsyncPipe, NgClass, NgForOf, NgIf } from "@angular/common";
import { EntityLabelComponent } from "./component/entity-label/entity-label.component";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { EntityFilterComponent } from "./component/entity-filter/entity-filter.component";
import { EntitySortComponent } from "./component/entity-sort/entity-sort.component";
import { MatDialogActions, MatDialogClose, MatDialogContent } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterLink } from "@angular/router";
import { MatSortModule } from "@angular/material/sort";
import { MatRippleModule } from "@angular/material/core";
import { EntityEditorComponent } from "./component/entity-editor/entity-editor.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatTreeModule } from "@angular/material/tree";
import {
  EntityFilterExpressionComponent
} from "./component/entity-filter-expression/entity-filter-expression.component";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";

@NgModule({
  declarations: [
    EntityListComponent,
    EntityBrowserComponent,
    EntityLabelComponent,
    EntityFilterExpressionComponent,
    EntitySortComponent,
    EntityEditorComponent,
    EntityFilterComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    NgForOf,
    NgIf,
    MatTableModule,
    MatPaginatorModule,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
    MatSlideToggleModule,
    FormsModule,
    MatInputModule,
    MatTooltipModule,
    RouterLink,
    MatSortModule,
    MatRippleModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatDialogClose,
    AsyncPipe,
    NgClass,
    MatTreeModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatCheckboxModule
  ],
  providers: [],
  exports: [
    EntityListComponent,
    EntityBrowserComponent,
    EntityLabelComponent,
    EntityFilterExpressionComponent,
    EntitySortComponent,
    EntityEditorComponent,
    EntityFilterComponent
  ]
})
export class EntityModule {}
