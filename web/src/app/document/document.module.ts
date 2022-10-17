import {NgModule} from "@angular/core";
import {DocumentBrowserComponent} from "./component/document-browser/document-browser.component";
import {MatListModule} from "@angular/material/list";
import {NgForOf} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {DocumentRegularExpenseComponent} from "./component/document-regular-expense/document-regular-expense.component";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {CommonModule} from "../common/common.module";

@NgModule({
  declarations: [
    DocumentBrowserComponent,
    DocumentRegularExpenseComponent
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
    CommonModule
  ],
  exports: [
    DocumentBrowserComponent,
    DocumentRegularExpenseComponent
  ]
})
export class DocumentModule {}
