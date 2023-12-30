import { NgModule } from "@angular/core";
import { EntityBrowserComponent } from "./component/entity-browser/entity-browser.component";
import { CommonModule } from "../common/common.module";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { EntityListComponent } from "./component/entity-list/entity-list.component";
import { NgForOf, NgIf } from "@angular/common";
import { EntityLabelComponent } from "./component/entity-label/entity-label.component";

@NgModule({
  declarations: [
    EntityListComponent,
    EntityBrowserComponent,
    EntityLabelComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    NgForOf,
    NgIf
  ],
  providers: [],
  exports: [
    EntityListComponent,
    EntityBrowserComponent,
    EntityLabelComponent
  ]
})
export class EntityModule {}
