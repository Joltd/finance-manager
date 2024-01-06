import { Component, OnInit } from "@angular/core";
import { EntityService } from "../../service/entity.service";
import { Entity } from "../../model/entity";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'entity-editor',
  templateUrl: './entity-editor.component.html',
  styleUrls: ['./entity-editor.component.scss']
})
export class EntityEditorComponent implements OnInit {

  isNew: boolean = true
  form: FormGroup | null = null

  constructor(
    private entityService: EntityService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.onInit().then()
  }

  private async onInit() {
    let params = await firstValueFrom(this.activatedRoute.params)
    await this.entityService.setEntity(params['name'])

    let formGroup: Record<string, FormControl> = {}
    for (let field of this.entityService.entity.fields) {
      formGroup[field.name] = field.nullable
        ? new FormControl(null)
        : new FormControl(null, Validators.required)
      if (field.type == 'ID') {
        formGroup[field.name].disable()
      }
    }
    this.form = new FormGroup(formGroup)

    let id = params['id']
    this.isNew = id == 'new'
    if (!this.isNew) {
      this.entityService.byId(id)
        .subscribe(result => this.form?.setValue(result))
    }
  }

  entity(): Entity {
    return this.entityService.entity
  }

  save() {
    if (!this.form?.valid) {
      return
    }
    this.entityService.update(this.form?.getRawValue())
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['entity', this.entity().name]).then()
  }

}
