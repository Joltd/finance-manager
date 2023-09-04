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
export class ImportDataStartComponent implements OnInit, OnDestroy {

  form: FormGroup = new FormGroup({
    parser: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    file: new FormControl(null, Validators.required)
  })

  constructor(
    private importDataService: ImportDataService,
    private toolbarService: ToolbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.toolbarService.setupSaveClose('Import', () => this.start(), () => this.close())
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
  }

  start() {
    if (this.form.invalid) {
      return
    }
    this.importDataService.preparationStart(this.form.value)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

}
