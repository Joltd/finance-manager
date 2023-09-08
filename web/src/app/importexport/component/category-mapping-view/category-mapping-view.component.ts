import {Component, Input} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CategoryMapping} from "../../model/category-mapping";

@Component({
  selector: 'category-mapping-view',
  templateUrl: './category-mapping-view.component.html',
  styleUrls: ['./category-mapping-view.component.scss']
})
export class CategoryMappingViewComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    parser: new FormControl(null, Validators.required),
    pattern: new FormControl(null, Validators.required),
    category: new FormControl(null, Validators.required)
  })

  get categoryMapping(): CategoryMapping | null {
    if (this.form.value) {
      return this.form.value
    } else {
      return null
    }
  }

  @Input()
  set categoryMapping(categoryMapping: CategoryMapping | null) {
    if (categoryMapping == null) {
      return
    } else {
      this.form.patchValue(categoryMapping)
    }
  }

  get valid(): boolean {
    return this.form.valid
  }

}
