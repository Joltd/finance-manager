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

@NgModule({
  declarations: [
    EntityListComponent,
    EntityBrowserComponent,
    EntityLabelComponent,
    EntityFilterComponent,
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
    MatPaginatorModule
  ],
  providers: [],
  exports: [
    EntityListComponent,
    EntityBrowserComponent,
    EntityLabelComponent,
    EntityFilterComponent,
    EntitySortComponent
  ]
})
export class EntityModule {}
