import {NgModule} from "@angular/core";
import {AmountInputComponent} from "./component/amount-input/amount-input.component";
import {ReactiveFormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {ReferenceInputComponent} from "./component/reference-input/reference-input.component";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {ReferenceSelectComponent} from "./component/reference-select/reference-select.component";
import {MatListModule} from "@angular/material/list";
import {MatDialogModule} from "@angular/material/dialog";
import {MatCardModule} from "@angular/material/card";
import {FileInputComponent} from "./component/file-input/file-input.component";
import {AmountPipe} from "./model/amount";
import {AmountLabelComponent} from "./component/amount-label/amount-label.component";
import {MatTooltipModule} from "@angular/material/tooltip";
import {CurrencyLabelComponent} from "./component/currency-label/currency-label.component";
import {DateLabelComponent} from "./component/date-label/date-label.component";

@NgModule({
  declarations: [
    AmountInputComponent,
    ReferenceInputComponent,
    ReferenceSelectComponent,
    FileInputComponent,
    AmountPipe,
    AmountLabelComponent,
    CurrencyLabelComponent,
    DateLabelComponent
  ],
  imports: [
    ReactiveFormsModule,
    NgForOf,
    MatIconModule,
    NgIf,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatListModule,
    MatDialogModule,
    MatCardModule,
    NgClass,
    MatTooltipModule
  ],
  exports: [
    AmountInputComponent,
    ReferenceInputComponent,
    FileInputComponent,
    AmountPipe,
    AmountLabelComponent,
    DateLabelComponent
  ]
})
export class CommonModule {}
