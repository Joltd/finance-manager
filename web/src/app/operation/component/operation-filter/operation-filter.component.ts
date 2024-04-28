import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { AdaptiveService } from "../../../common/service/adaptive.service";
import { FormControl, FormGroup } from "@angular/forms";
import { OperationFilter } from "../../model/operation";

@Component({
  selector: 'operation-filter',
  templateUrl: 'operation-filter.component.html',
  styleUrls: ['operation-filter.component.scss'],
})
export class OperationFilterComponent {

  form: FormGroup = new FormGroup({
    dateFrom: new FormControl(null),
    dateTo: new FormControl(null),
    type: new FormControl(null),
    account: new FormControl(null),
    currency: new FormControl(null),
  })

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<OperationFilterComponent>,
    @Inject(MAT_DIALOG_DATA) data: OperationFilter,
  ) {
    this.form.setValue(data)
  }

  apply() {
    this.dialogRef.close(this.form.value)
  }

  close() {
    this.dialogRef.close()
  }
}
