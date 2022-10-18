import {NgModule} from "@angular/core";
import {AmountInputComponent} from "./component/amount-input/amount-input.component";
import {ReactiveFormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {ReferenceInputComponent} from "./component/reference-input/reference-input.component";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {ReferenceSelectComponent} from "./component/reference-select/reference-select.component";
import {MatListModule} from "@angular/material/list";
import {MatDialogModule} from "@angular/material/dialog";
import {EditToolbarComponent} from "./component/edit-toolbar/edit-toolbar.component";
import {MatCardModule} from "@angular/material/card";
import {FileInputComponent} from "./component/file-input/file-input.component";
import {AmountPipe} from "./model/amount";

@NgModule({
  declarations: [
    AmountInputComponent,
    ReferenceInputComponent,
    ReferenceSelectComponent,
    EditToolbarComponent,
    FileInputComponent,
    AmountPipe
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
    MatCardModule
  ],
  exports: [
    AmountInputComponent,
    ReferenceInputComponent,
    EditToolbarComponent,
    FileInputComponent,
    AmountPipe
  ]
})
export class CommonModule {}
