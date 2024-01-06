import { NgModule } from "@angular/core";
import { EntityBrowserComponent } from "./component/entity-browser/entity-browser.component";
import { CommonModule } from "../common/common.module";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { EntityListComponent } from "./component/entity-list/entity-list.component";
import { NgForOf, NgIf } from "@angular/common";
import { EntityLabelComponent } from "./component/entity-label/entity-label.component";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { EntityFilterComponent } from "./component/entity-filter/entity-filter.component";
import { EntitySortComponent } from "./component/entity-sort/entity-sort.component";
import { MatDialogActions, MatDialogContent } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { EntityFilterInputComponent } from "./component/entity-filter-input/entity-filter-input.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { EntityFilterConditionComponent } from "./component/entity-filter-condition/entity-filter-condition.component";

@NgModule({
  declarations: [
    EntityListComponent,
    EntityBrowserComponent,
    EntityLabelComponent,
    EntityFilterComponent,
    EntityFilterConditionComponent,
    EntityFilterInputComponent,
    EntitySortComponent
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
    MatInputModule
  ],
  providers: [],
  exports: [
    EntityListComponent,
    EntityBrowserComponent,
    EntityLabelComponent,
    EntityFilterComponent,
    EntityFilterConditionComponent,
    EntityFilterInputComponent,
    EntitySortComponent
  ]
})
export class EntityModule {}
