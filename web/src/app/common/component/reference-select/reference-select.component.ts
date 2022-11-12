import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Reference} from "../../model/reference";
import {HttpClient} from "@angular/common/http";
import {TypeUtils} from "../../service/type-utils";
import {ReferenceService} from "../../service/reference.service";

@Component({
  selector: 'reference-select',
  templateUrl: 'reference-select.component.html',
  styleUrls: ['reference-select.component.scss']
})
export class ReferenceSelectComponent {

  static NULL_RESULT = "NULL_RESULT"
  references: Reference[] = []

  constructor(
    private dialogRef: MatDialogRef<ReferenceSelectComponent>,
    private referenceService: ReferenceService,
    @Inject(MAT_DIALOG_DATA) api: string
  ) {
    this.referenceService.list(api)
      .subscribe(result => this.references = result)
  }

  select(id: string | null) {
    if (id == null) {
      this.dialogRef.close(ReferenceSelectComponent.NULL_RESULT)
    } else {
      this.dialogRef.close(id)
    }
  }

  close() {
    this.dialogRef.close()
  }

}
