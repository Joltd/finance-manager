import {NgModule} from "@angular/core";
import {DashboardComponent} from "./component/dashboard/dashboard.component";
import {MatCardModule} from "@angular/material/card";
import {NgForOf} from "@angular/common";
import {CommonModule} from "../common/common.module";
import {MatListModule} from "@angular/material/list";

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    MatCardModule,
    NgForOf,
    CommonModule,
    MatListModule
  ],
  exports: [
    DashboardComponent
  ]
})
export class ReportModule {}
