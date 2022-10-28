import {NgModule} from "@angular/core";
import {ExportDataBeginComponent} from "./component/export-data-begin/export-data-begin.component";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {CommonModule} from "../common/common.module";
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    ExportDataBeginComponent
  ],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    ExportDataBeginComponent
  ]
})
export class ExportDataModule {}
