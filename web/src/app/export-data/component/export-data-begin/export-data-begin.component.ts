import {Component} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ExportDataService} from "../../service/export-data.service";
import {Router} from "@angular/router";
import {saveAs} from 'file-saver';
import * as moment from "moment";

@Component({
  selector: 'export-data-begin',
  templateUrl: 'export-data-begin.component.html',
  styleUrls: ['export-data-begin.component.scss']
})
export class ExportDataBeginComponent {

  form: FormGroup = new FormGroup({
    account: new FormControl(null)
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
        let date = moment().format("yyyy-MM-DD")
        saveAs(result, `data-${date}.csv`)
      })
  }

  close() {
    this.router.navigate(['/']).then()
  }

}
