import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {CategoryMappingService} from "../../service/category-mapping.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToolbarService} from "../../../common/service/toolbar.service";

@Component({
  selector: 'category-mapping-editor',
  templateUrl: './category-mapping-editor.component.html',
  styleUrls: ['./category-mapping-editor.component.scss']
})
export class CategoryMappingEditorComponent implements OnInit, OnDestroy {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    parser: new FormControl(null),
    pattern: new FormControl(null),
    category: new FormControl(null)
  })

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private categoryMappingService: CategoryMappingService,
    private toolbarService: ToolbarService,
  ) {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if (id != 'new') {
        this.form.patchValue({id})
        this.load()
      }
    })
  }

  ngOnInit(): void {
    this.toolbarService.setupSaveClose(
      'Category Mapping',
      () => this.save(),
      () => this.close()
    )
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
  }

  private load() {
    this.categoryMappingService.byId(this.form.value.id)
      .subscribe(result => {
        this.form.patchValue(result)
      })
  }

  save() {
    if (this.form.invalid) {
      return
    }

    this.categoryMappingService.update(this.form.value)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['category-mapping']).then()
  }

}
