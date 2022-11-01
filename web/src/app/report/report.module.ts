import {NgModule} from "@angular/core";
import {DashboardComponent} from "./component/dashboard/dashboard.component";
import {MatCardModule} from "@angular/material/card";
import {NgForOf, NgIf} from "@angular/common";
import {CommonModule} from "../common/common.module";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {FlowChartComponent} from "./component/flow-chart/flow-chart.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {ReactiveFormsModule} from "@angular/forms";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

@NgModule({
  declarations: [
    DashboardComponent,
    FlowChartComponent
  ],
  imports: [
    MatCardModule,
    NgForOf,
    CommonModule,
    MatListModule,
    MatChipsModule,
    NgIf,
    MatExpansionModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    DashboardComponent,
    FlowChartComponent
  ]
})
export class ReportModule {}
