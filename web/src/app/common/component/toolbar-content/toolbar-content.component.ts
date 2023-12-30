import {
  AfterViewInit,
  Component,
  ContentChildren,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from "@angular/core";
import { ToolbarButtonComponent } from "../toolbar-button/toolbar-button.component";
import { ToolbarService } from "../../service/toolbar.service";

@Component({
  selector: 'toolbar-content',
  templateUrl: 'toolbar-content.component.html',
  styleUrls: ['toolbar-content.component.scss']
})
export class ToolbarContentComponent implements AfterViewInit, OnDestroy {

  @Input()
  title!: string

  @ContentChildren(ToolbarButtonComponent)
  buttons!: QueryList<ToolbarButtonComponent>

  constructor(
    private toolbarService: ToolbarService
  ) {}

  ngAfterViewInit() {
    let commands = this.buttons.map(button => {
      return {
        name: button.name,
        icon: button.icon,
        action: () => button.click.emit()
      }
    })
    this.toolbarService.setup(this.title, commands)
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
  }

}
