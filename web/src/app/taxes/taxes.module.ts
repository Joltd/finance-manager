import { NgModule } from "@angular/core";
import { NewTaxComponent } from "./component/new-tax/new-tax.component";
import { CommonModule } from "../common/common.module";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatListModule } from "@angular/material/list";
import { OperationModule } from "../operation/operation.modules";
import { MatStepperModule } from "@angular/material/stepper";
import { MatButtonModule } from "@angular/material/button";

@NgModule({
  declarations: [
    NewTaxComponent,
  ],
  imports: [
    CommonModule,
    MatInputModule,
    FormsModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatListModule,
    OperationModule,
    MatStepperModule,
    MatButtonModule
  ],
  exports: [
    NewTaxComponent,
  ],
})
export class TaxesModule {}
