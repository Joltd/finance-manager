import {Component} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ExportDataService} from "../../service/export-data.service";
import {Router} from "@angular/router";
import {saveAs} from 'file-saver';

@Component({
  selector: 'export-data-begin',
  templateUrl: 'export-data-begin.component.html',
  styleUrls: ['export-data-begin.component.scss']
})
export class ExportDataBeginComponent {

  form: FormGroup = new FormGroup({
    account: new FormControl(null, Validators.required)
  })

  constructor(
    private router: Router,
    private exportDataService: ExportDataService
  ) {}

  save() {
    if (!this.form.valid) {
      return
    }
    this.exportDataService.exportData(this.form.value.account)
      .subscribe(result => {
        saveAs(result, "export-data.csv")
      })
  }

  close() {
    this.router.navigate(['/']).then()
  }

}
