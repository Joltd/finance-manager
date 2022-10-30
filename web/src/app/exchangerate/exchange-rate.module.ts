import {NgModule} from "@angular/core";
import {ExchangeRateBrowserComponent} from "./component/exchange-rate-browser/exchange-rate-browser.component";
import {ExchangeRateEditorComponent} from "./component/exchange-rate-editor/exchange-rate-editor.component";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {NgForOf} from "@angular/common";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";

@NgModule({
  declarations: [
    ExchangeRateBrowserComponent,
    ExchangeRateEditorComponent
  ],
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    NgForOf,
    MatDatepickerModule,
    MatListModule,
    MatMenuModule
  ],
  exports: [
    ExchangeRateBrowserComponent,
    ExchangeRateEditorComponent
  ]
})
export class ExchangeRateModule {}
