import {NgModule} from "@angular/core";
import {DashboardComponent} from "./component/dashboard/dashboard.component";
import {MatCardModule} from "@angular/material/card";
import {NgForOf, NgIf} from "@angular/common";
import {CommonModule} from "../common/common.module";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";

@NgModule({
  declarations: [
    DashboardComponent
  ],
    imports: [
        MatCardModule,
        NgForOf,
        CommonModule,
        MatListModule,
        MatChipsModule,
        NgIf
    ],
  exports: [
    DashboardComponent
  ]
})
export class ReportModule {}
