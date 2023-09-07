import {Component, Inject} from "@angular/core";
import {Operation} from "../../model/operation";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'operation-editor-dialog',
  templateUrl: './operation-editor-dialog.component.html',
  styleUrls: ['./operation-editor-dialog.component.scss']
})
export class OperationEditorDialogComponent {

  operation!: Operation

  constructor(
    @Inject(MAT_DIALOG_DATA) data: Operation
  ) {
    this.operation = data
  }

}
