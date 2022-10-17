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

  importData: FormGroup = new FormGroup({
    account: new FormControl(null, Validators.required),
    template: new FormControl(null, Validators.required),
    file: new FormControl(null, Validators.required)
  })

  constructor(
    private router: Router,
    private importDataService: ImportDataService
  ) {}

  save() {
    let formValue = this.importData.value
    let importData = new ImportData()
    importData.account = formValue.account
    importData.template = formValue.template
    this.importDataService.uploadFile(formValue.file)
      .subscribe(result => {
        importData.file = result.filename
        this.importDataService.create(importData)
          .subscribe(() => this.close())
      })
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

}
