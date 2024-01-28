import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ImportDataService} from "../../service/import-data.service";
import {ToolbarService} from "../../../common/service/toolbar.service";

@Component({
  selector: "import-data-start",
  templateUrl: "./import-data-start.component.html",
  styleUrls: ["./import-data-start.component.scss"]
})
export class ImportDataStartComponent {

  form: FormGroup = new FormGroup({
    parser: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    currency: new FormControl(null),
    file: new FormControl(null, Validators.required)
  })

  constructor(
    private importDataService: ImportDataService,
    private router: Router
  ) {}

  start() {
    if (this.form.invalid) {
      return
    }
    let request = {
      parser: this.form.value.parser.id,
      account: this.form.value.account.id,
      currency: this.form.value.currency,
      file: this.form.value.file
    }
    this.importDataService.preparationStart(request)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

}
