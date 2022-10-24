import {NgModule} from "@angular/core";
import {DashboardComponent} from "./component/dashboard/dashboard.component";
import {MatCardModule} from "@angular/material/card";

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    MatCardModule
  ],
  exports: [
    DashboardComponent
  ]
})
export class ReportModule {}
