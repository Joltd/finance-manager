import {Component} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {CategoryMappingService} from "../../service/category-mapping.service";

@Component({
  selector: 'category-mapping-editor',
  templateUrl: './category-mapping-editor.component.html',
  styleUrls: ['./category-mapping-editor.component.scss']
})
export class CategoryMappingEditorComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    parser: new FormControl(null),
    pattern: new FormControl(null),
    categoryType: new FormControl('expense'),
    category: new FormControl(null)
  })

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private categoryMappingService: CategoryMappingService,
  ) {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if (id != 'new') {
        this.form.patchValue({id})
        this.load()
      }
    })
  }

  private load() {
    this.categoryMappingService.byId(this.form.value.id)
      .subscribe(result => {
        this.form.patchValue(result)
      })
  }

  save() {
    console.log(this.form.value)
    this.categoryMappingService.update(this.form.value)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['category-mapping']).then()
  }

}
