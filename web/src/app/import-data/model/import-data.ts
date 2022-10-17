import {ImportDataEntry} from "./import-data-entry";

export class ImportData {
  id!: string
  account!: string
  template!: string
  file!: string
  entries: ImportDataEntry[] = []
}

export class ImportDataFileResponse {
  filename!: string
}
