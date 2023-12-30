import {NgModule} from "@angular/core";
import {AmountInputComponent} from "./component/amount-input/amount-input.component";
import {ReactiveFormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {ReferenceInputComponent} from "./component/reference-input/reference-input.component";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatListModule} from "@angular/material/list";
import {MatDialogModule} from "@angular/material/dialog";
import {MatCardModule} from "@angular/material/card";
import {FileInputComponent} from "./component/file-input/file-input.component";
import {AmountPipe} from "./model/amount";
import {AmountLabelComponent} from "./component/amount-label/amount-label.component";
import {MatTooltipModule} from "@angular/material/tooltip";
import {CurrencyLabelComponent} from "./component/currency-label/currency-label.component";
import {DateLabelComponent} from "./component/date-label/date-label.component";
import {EntrySelectComponent} from "./component/entry-select/entry-select.component";
import {EntryItemComponent} from "./component/entry-item/entry-item.component";
import {CurrencySelectComponent} from "./component/currency-select/currency-select.component";
import {CurrencyInputComponent} from "./component/currency-input/currency-input.component";
import {EditorComponent} from "./component/editor/editor.component";
import {OverlayModule} from "@angular/cdk/overlay";
import {PortalModule} from "@angular/cdk/portal";
import {BadgeComponent} from "./component/badge/badge.component";
import {NoDataComponent} from "./component/no-data/no-data.component";
import { ToolbarContentComponent } from "./component/toolbar-content/toolbar-content.component";
import { ToolbarButtonComponent } from "./component/toolbar-button/toolbar-button.component";
import { FabGroupComponent } from "./component/fab-group/fab-group.component";

@NgModule({
  declarations: [
    AmountInputComponent,
    ReferenceInputComponent,
    FileInputComponent,
    AmountPipe,
    AmountLabelComponent,
    CurrencyLabelComponent,
    CurrencySelectComponent,
    CurrencyInputComponent,
    DateLabelComponent,
    EntrySelectComponent,
    EntryItemComponent,
    EditorComponent,
    BadgeComponent,
    NoDataComponent,
    ToolbarContentComponent,
    ToolbarButtonComponent,
    FabGroupComponent
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
    MatTooltipModule,
    OverlayModule,
    PortalModule
  ],
  exports: [
    AmountInputComponent,
    ReferenceInputComponent,
    FileInputComponent,
    AmountPipe,
    AmountLabelComponent,
    CurrencyLabelComponent,
    CurrencySelectComponent,
    CurrencyInputComponent,
    DateLabelComponent,
    EntrySelectComponent,
    EntryItemComponent,
    EditorComponent,
    BadgeComponent,
    NoDataComponent,
    ToolbarContentComponent,
    ToolbarButtonComponent,
    FabGroupComponent
  ]
})
export class CommonModule {}
