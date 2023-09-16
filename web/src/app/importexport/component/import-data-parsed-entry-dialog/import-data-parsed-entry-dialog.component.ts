import {Component, Inject} from "@angular/core";
import {ImportDataParsedEntry} from "../../model/import-data";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'import-data-parsed-entry-dialog',
  templateUrl: './import-data-parsed-entry-dialog.component.html',
  styleUrls: ['./import-data-parsed-entry-dialog.component.scss']
})
export class ImportDataParsedEntryDialogComponent {

  parsedEntry!: ImportDataParsedEntry

  constructor(
    @Inject(MAT_DIALOG_DATA) data: ImportDataParsedEntry,
  ) {
    this.parsedEntry = data
  }

}
