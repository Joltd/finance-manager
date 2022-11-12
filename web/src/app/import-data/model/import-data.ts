import {DocumentTyped} from "../../document/model/document-typed";

export class ImportData {
  id!: string
  file!: string
  description!: string
  documents: DocumentEntry[] = []
}

export class DocumentEntry {
  id!: string
  source!: string
  suggested!: DocumentTyped
  existed!: DocumentTyped
}

export class ImportDataFileResponse {
  filename!: string
}

export class ImportDataResult {
  id!: string
  entries: DocumentEntryResult[] = []
}

export class DocumentEntryResult {
  id!: string
  result!: boolean
  message!: string
}
