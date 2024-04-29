import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PricingService } from "../../service/pricing.service";
import { ShortMessageService } from "../../../common/service/short-message.service";
import { PricingItem } from "../../model/pricing-item";
import { MatStepper } from "@angular/material/stepper";
import * as moment from "moment/moment";

@Component({
  selector: 'pricing-new-price',
  templateUrl: './pricing-new-price.component.html',
  styleUrls: ['./pricing-new-price.component.scss']
})
export class PricingNewPriceComponent implements OnInit {

  @ViewChild(MatStepper)
  stepper!: MatStepper

  form = new FormGroup({
    date: new FormControl(moment().format('yyyy-MM-DD'), Validators.required),
    itemId: new FormControl(null),
    item: new FormControl('', Validators.required),
    category: new FormControl(null, Validators.required),
    unit: new FormControl(null, Validators.required),
    defaultQuantity: new FormControl(null, Validators.required),
    price: new FormControl(null, Validators.required),
    quantity: new FormControl(null, Validators.required),
    country: new FormControl(null, Validators.required),
    city: new FormControl(null, Validators.required),
    store: new FormControl(null, Validators.required),
    comment: new FormControl(null),
  })
  items: PricingItem[] = []

  constructor(
    private pricingService: PricingService,
    private shortMessageService: ShortMessageService
  ) {
  }

  ngOnInit(): void {
    this.reset()
  }

  searchItem() {
    let query = this.form.value.item
    if (query && query.length > 2) {
      this.pricingService.searchItems(query)
        .subscribe(items => this.items = items)
    }
  }

  selectItem(item: PricingItem) {
    this.form.patchValue({
      itemId: item.id,
      item: item.name,
      category: item.category,
      unit: item.unit,
      defaultQuantity: item.defaultQuantity,
      quantity: item.defaultQuantity,
    } as any)
    this.stepper.selectedIndex = 2
  }

  save() {
    let order = {
      date: this.form.value.date,
      item: {
        id: this.form.value.itemId,
        name: this.form.value.item,
        category: this.form.value.category,
        unit: this.form.value.unit,
        defaultQuantity: this.form.value.defaultQuantity,
      },
      price: this.form.value.price,
      quantity: this.form.value.quantity,
      country: this.form.value.country,
      city: this.form.value.city,
      store: this.form.value.store,
      comment: this.form.value.comment,
    }
    this.pricingService.createOrder(order)
      .subscribe(() => {
        this.shortMessageService.show('Order created')
        this.reset()
      })
  }

  private reset() {
    this.form.reset()
    if (this.stepper) {
      this.stepper.selectedIndex = 0
    }
    this.items = []
    this.pricingService.orderDefaults()
      .subscribe(defaults => {
        this.form.patchValue({
          date: defaults.date,
          price: {
            value: null,
            currency: defaults.currency,
          },
          country: defaults.country,
          city: defaults.city,
          store: defaults.store,
        } as any)
      })
  }

}
