import {Component} from "@angular/core";
import {ImportDataService} from "../../service/import-data.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'import-data-begin',
  templateUrl: 'import-data-begin.component.html',
  styleUrls: ['import-data-begin.component.scss']
})
export class ImportDataBeginComponent {

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
