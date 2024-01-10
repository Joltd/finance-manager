import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {CategoryMappingService} from "../../service/category-mapping.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {CategoryMapping} from "../../model/category-mapping";
import {CategoryMappingViewComponent} from "../category-mapping-view/category-mapping-view.component";

@Component({
  selector: 'category-mapping-editor',
  templateUrl: './category-mapping-editor.component.html',
  styleUrls: ['./category-mapping-editor.component.scss']
})
export class CategoryMappingEditorComponent {

  categoryMapping!: CategoryMapping

  @ViewChild(CategoryMappingViewComponent)
  categoryMappingView!: CategoryMappingViewComponent

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private categoryMappingService: CategoryMappingService,
  ) {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if (id != 'new') {
        this.categoryMappingService.byId(id)
          .subscribe(result => this.categoryMapping = result)
      }
    })
  }

  save() {
    if (!this.categoryMappingView.valid) {
      return
    }

    this.categoryMappingService.update(this.categoryMappingView.categoryMapping)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['category-mapping']).then()
  }

}
