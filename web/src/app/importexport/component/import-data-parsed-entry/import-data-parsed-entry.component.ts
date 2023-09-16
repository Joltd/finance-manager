import {Component, Input} from "@angular/core";
import {ImportDataParsedEntry} from "../../model/import-data";

@Component({
  selector: 'import-data-parsed-entry',
  templateUrl: './import-data-parsed-entry.component.html',
  styleUrls: ['./import-data-parsed-entry.component.scss']
})
export class ImportDataParsedEntryComponent {

  @Input()
  parsedEntry!: ImportDataParsedEntry

  @Input()
  hideType: boolean = false

  @Input()
  hideAccounts: boolean = false

  @Input()
  hideDescription: boolean = false

  @Input()
  hideRawEntries: boolean = false

}
