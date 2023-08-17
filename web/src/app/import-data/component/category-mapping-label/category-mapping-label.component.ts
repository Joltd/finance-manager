import {Component, Input} from "@angular/core";
import {CategoryMapping} from "../../model/category-mapping";

@Component({
  selector: 'category-mapping-label',
  templateUrl: 'category-mapping-label.component.html',
    styleUrls: ['category-mapping-label.component.scss']
})
export class CategoryMappingLabelComponent {

  @Input()
  hideParser: boolean = false

  @Input()
  categoryMapping!: CategoryMapping

}
