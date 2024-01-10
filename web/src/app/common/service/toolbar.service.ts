import {Injectable} from "@angular/core";
import {Command} from "../model/command";

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {

  title: string = 'Finance Manager'
  commands: Command[] = []

  setupTitle(title: string) {
    setTimeout(() => this.title = title, 100)
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
