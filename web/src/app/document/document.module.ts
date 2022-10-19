import {NgModule} from "@angular/core";
import {DocumentBrowserComponent} from "./component/document-browser/document-browser.component";
import {MatListModule} from "@angular/material/list";
import {NgForOf} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {DocumentExpenseComponent} from "./component/document-expense/document-expense.component";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {CommonModule} from "../common/common.module";
import {ReactiveFormsModule} from "@angular/forms";
import {MatNativeDateModule} from "@angular/material/core";
import {MatMenuModule} from "@angular/material/menu";
import {DocumentIncomeComponent} from "./component/document-income/document-income.component";

@NgModule({
  declarations: [
    DocumentBrowserComponent,
    DocumentExpenseComponent,
    DocumentIncomeComponent
  ],
  imports: [
    MatListModule,
    NgForOf,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    ReactiveFormsModule,
    MatMenuModule
  ],
  providers: [
    MatDatepickerModule
  ],
  exports: [
    DocumentBrowserComponent,
    DocumentExpenseComponent,
    DocumentIncomeComponent
  ]
})
export class DocumentModule {}
