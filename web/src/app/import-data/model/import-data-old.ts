import {DocumentTyped} from "../../document/model/document-typed";

export class ImportData {
  id!: string
  file!: string
  description!: string
  progress!: number
  entries: ImportDataEntry[] = []
}

export class ImportDataEntry {
  id!: string
  skip!: boolean
  result!: boolean | null
  message!: string
  raw!: string
  suggested!: DocumentTyped
  forRemove: DocumentTyped[] = []
}

export class ImportDataEntryForRemove {
  documents: string[] = []
}

export class ImportDataFileResponse {
  filename!: string
}
