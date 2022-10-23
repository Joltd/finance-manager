import {Amount} from "../../common/model/amount";
import {DocumentTyped} from "../../document/model/document-typed";

export class ImportData {
  id!: string
  account!: string
  template!: string
  file!: string
  documents: DocumentEntry[] = []
  other: DocumentTyped[] = []
}

export class DocumentEntry {
  source!: string
  suggested!: DocumentTyped
  existed!: DocumentTyped
}

export class ImportDataFileResponse {
  filename!: string
}
