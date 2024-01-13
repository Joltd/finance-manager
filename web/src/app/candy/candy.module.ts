import { NgModule } from "@angular/core";
import { CandyDashboardComponent } from "./component/candy-dashboard/candy-dashboard.component";
import { CandyExpenseComponent } from "./component/candy-expense/candy-expense.component";
import { CommonModule } from "../common/common.module";
import { MatDialogActions, MatDialogContent } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";

@NgModule({
  declarations: [
    CandyDashboardComponent,
    CandyExpenseComponent
  ],
  imports: [
    CommonModule,
    MatDialogActions,
    MatDialogContent,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
  ],
  exports: [
    CandyDashboardComponent,
    CandyExpenseComponent
  ]
})
export class CandyModule {}
