import {NgModule} from "@angular/core";
import {ExpenseCategoryBrowserComponent} from "./component/expense-category-browser/expense-category-browser.component";
import {ExpenseCategoryEditorComponent} from "./component/expense-category-editor/expense-category-editor.component";
import {MatListModule} from "@angular/material/list";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {NgForOf} from "@angular/common";
import {IncomeCategoryBrowserComponent} from "./component/income-category-browser/income-category-browser.component";
import {IncomeCategoryEditorComponent} from "./component/income-category-editor/income-category-editor.component";
import {AccountBrowserComponent} from "./component/account-browser/account-browser.component";
import {AccountEditorComponent} from "./component/account-editor/account-editor.component";

@NgModule({
  declarations: [
    ExpenseCategoryBrowserComponent,
    ExpenseCategoryEditorComponent,
    IncomeCategoryBrowserComponent,
    IncomeCategoryEditorComponent,
    AccountBrowserComponent,
    AccountEditorComponent
  ],
  imports: [
    MatListModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgForOf
  ],
  exports: [
    ExpenseCategoryBrowserComponent,
    ExpenseCategoryEditorComponent,
    IncomeCategoryBrowserComponent,
    IncomeCategoryEditorComponent,
    AccountBrowserComponent,
    AccountEditorComponent
  ]
})
export class ReferenceModule {

}
