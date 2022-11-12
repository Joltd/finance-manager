import {DocumentTyped} from "../../document/model/document-typed";

export class ImportData {
  id!: string
  file!: string
  description!: string
  documents: DocumentEntry[] = []
  currentProgress!: number
}

export class DocumentEntry {
  id!: string
  source!: string
  suggested!: DocumentTyped
  existed!: DocumentTyped
  result!: boolean
  message!: string
}

export class ImportDataFileResponse {
  filename!: string
}
