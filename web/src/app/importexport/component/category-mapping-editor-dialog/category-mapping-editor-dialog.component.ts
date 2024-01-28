import {Component, Inject} from "@angular/core";
import {CategoryMapping} from "../../model/category-mapping";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'category-mapping-editor-dialog',
  templateUrl: './category-mapping-editor-dialog.component.html',
  styleUrls: ['./category-mapping-editor-dialog.component.scss']
})
export class CategoryMappingEditorDialogComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    parser: new FormControl(null, Validators.required),
    pattern: new FormControl(null, Validators.required),
    category: new FormControl(null, Validators.required)
  })

  constructor(@Inject(MAT_DIALOG_DATA) data: CategoryMapping) {
    this.form.patchValue(data)
  }

  get categoryMapping(): CategoryMapping | null {
    if (this.form.value) {
      return this.form.value
    } else {
      return null
    }
  }

  valid(): boolean {
    return this.form.valid
  }

}
