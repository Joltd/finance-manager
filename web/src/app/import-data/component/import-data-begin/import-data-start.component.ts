import {Component} from "@angular/core";
import {ImportDataService} from "../../service/import-data.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'import-data-start',
  templateUrl: 'import-data-start.component.html',
  styleUrls: ['import-data-start.component.scss']
})
export class ImportDataStartComponent {

  form: FormGroup = new FormGroup({
    parser: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    file: new FormControl(null, Validators.required)
  })

  constructor(
    private router: Router,
    private importDataService: ImportDataService
  ) {}

  save() {
    this.importDataService.startPreparation(this.form.value)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

}
