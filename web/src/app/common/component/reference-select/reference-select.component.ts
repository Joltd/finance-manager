import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Reference} from "../../model/reference";
import {HttpClient} from "@angular/common/http";
import {TypeUtils} from "../../service/type-utils";

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
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) api: string
  ) {
    if (!api) {
      throw 'API URL is not specified'
    }
    this.http.get<Reference[]>(api, TypeUtils.of(Reference))
      .subscribe(result => this.references = result.sort((a,b) => a.name.localeCompare(b.name)))
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
