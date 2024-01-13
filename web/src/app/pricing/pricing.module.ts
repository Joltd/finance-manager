import { NgModule } from "@angular/core";
import { PricingNewPriceComponent } from "./component/pricing-new-price/pricing-new-price.component";
import { CommonModule } from "../common/common.module";
import { MatStepperModule } from "@angular/material/stepper";
import { MatButtonModule } from "@angular/material/button";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";

@NgModule({
  declarations: [
    PricingNewPriceComponent,
  ],
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatDatepickerModule
  ],
  exports: [
    PricingNewPriceComponent,
  ],
})
export class PricingModule {}
