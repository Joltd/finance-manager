import {Component} from "@angular/core";
import {ImportDataService} from "../../service/import-data.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ImportData} from "../../model/import-data";
import {Router} from "@angular/router";

@Component({
  selector: 'import-data-begin',
  templateUrl: 'import-data-begin.component.html',
  styleUrls: ['import-data-begin.component.scss']
})
export class ImportDataBeginComponent {

  form: FormGroup = new FormGroup({
    file: new FormControl(null, Validators.required),
    description: new FormControl('')
  })

  constructor(
    private router: Router,
    private importDataService: ImportDataService
  ) {}

  save() {
    let formValue = this.form.value
    let importData = new ImportData()
    this.importDataService.uploadFile(formValue.file)
      .subscribe(result => {
        importData.file = result.filename
        importData.description = formValue.description
        this.importDataService.create(importData)
          .subscribe(() => this.close())
      })
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

}
