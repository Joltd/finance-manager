import {DocumentTyped} from "./document-typed";

export class DocumentPage {
  total!: number
  page!: number
  size!: number
  documents: DocumentTyped[] = []
}
