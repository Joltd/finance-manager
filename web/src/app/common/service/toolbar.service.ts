import {Injectable} from "@angular/core";
import {Command} from "../model/command";

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {

  title: string = 'Finance Manager'
  commands: Command[] = []

  setupSaveClose(title: string, onSave: () => void, onClose: () => void) {
    this.setup(
      title,
      [
        {
          name: 'save',
          icon: 'done',
          action: onSave
        },
        {
          name: 'close',
          icon: 'close',
          action: onClose
        }
      ]
    )
  }

  setup(title: string, commands: Command[] = []) {
    setTimeout(() => {
      this.title = title
      this.commands = commands
    }, 10)
  }

  reset() {
    this.title = 'Finance Manager'
    this.commands = []
  }

}
