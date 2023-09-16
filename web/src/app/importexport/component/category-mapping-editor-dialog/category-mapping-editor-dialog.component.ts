import {Component, Inject} from "@angular/core";
import {CategoryMapping} from "../../model/category-mapping";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'category-mapping-editor-dialog',
  templateUrl: './category-mapping-editor-dialog.component.html',
  styleUrls: ['./category-mapping-editor-dialog.component.scss']
})
export class CategoryMappingEditorDialogComponent {

  categoryMapping!: CategoryMapping

  constructor(@Inject(MAT_DIALOG_DATA) data: CategoryMapping) {
    this.categoryMapping = data
  }

}
