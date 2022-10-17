import {Injectable} from '@angular/core';
import {ShortMessageService} from "./short-message.service";

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  private errors: ErrorLogEntry[] = []

  constructor(private shortMessageService: ShortMessageService) {}

  errorLog(): ErrorLogEntry[] {
    return this.errors
  }

  register(type: Type, message: string) {
    let entry = new ErrorLogEntry()
    entry.type = type
    entry.message = message
    this.errors.push(entry)
    this.shortMessageService.show(message)
  }

  clear() {
    this.errors = []
  }

}

export class ErrorLogEntry {
  type!: Type
  message!: string
}

export type Type = 'ERROR' | 'WARNING'
