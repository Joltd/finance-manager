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
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {CategoryChartComponent} from "./component/category-chart/category-chart.component";
import {FlowGraphChartComponent} from "./component/flow-graph-chart/flow-graph-chart.component";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {FundSnapshotViewComponent} from "./component/fund-snapshot-view/fund-snapshot-view.component";
import {DocumentModule} from "../document/document.module";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatTooltipModule} from "@angular/material/tooltip";

@NgModule({
  declarations: [
    DashboardComponent,
    FlowChartComponent,
    CategoryChartComponent,
    FlowGraphChartComponent,
    FundSnapshotViewComponent
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
    MatIconModule,
    MatProgressSpinnerModule,
    DocumentModule,
    MatProgressBarModule,
    MatButtonToggleModule,
    FormsModule,
    MatTooltipModule
  ],
  exports: [
    DashboardComponent,
    FlowChartComponent,
    CategoryChartComponent
  ]
})
export class ReportModule {}
