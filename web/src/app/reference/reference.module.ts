import {NgModule} from "@angular/core";
import {MatListModule} from "@angular/material/list";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {AccountBrowserComponent} from "./component/account-browser/account-browser.component";
import {AccountEditorComponent} from "./component/account-editor/account-editor.component";
import {CommonModule} from "../common/common.module";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {CurrencyBrowserComponent} from "./component/currency-browser/currency-browser.component";
import {MatSelectModule} from "@angular/material/select";
import {CurrencyEditorComponent} from "./component/currency-editor/currency-editor.component";
import {AccountInputComponent} from "./component/account-input/account-input.component";
import {PortalModule} from "@angular/cdk/portal";
import {MatTabsModule} from "@angular/material/tabs";
import {MatDatepickerModule} from "@angular/material/datepicker";

@NgModule({
  declarations: [
    AccountBrowserComponent,
    AccountEditorComponent,
    AccountInputComponent,
    CurrencyBrowserComponent,
    CurrencyEditorComponent
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
        NgForOf,
        NgIf,
        CommonModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatSelectModule,
        PortalModule,
        MatTabsModule,
        NgClass,
        MatDatepickerModule
    ],
  exports: [
    AccountBrowserComponent,
    AccountEditorComponent,
    AccountInputComponent,
    CurrencyBrowserComponent,
    CurrencyEditorComponent
  ]
})
export class ReferenceModule {

}
