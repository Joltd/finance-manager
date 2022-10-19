import {Component, EventEmitter, Input, Output} from "@angular/core";
import {NavigationService} from "../../service/navigation.service";
import {Observable} from "rxjs";

@Component({
  selector: 'edit-toolbar',
  templateUrl: 'edit-toolbar.component.html',
  styleUrls: ['edit-toolbar.component.scss']
})
export class EditToolbarComponent {

  @Input()
  title: string = ''

  @Input()
  save: () => Observable<void> = () => new EventEmitter<void>()

  constructor(private navigationService: NavigationService) {}

  doSave() {
    this.save().subscribe(() => this.navigationService.back())
  }

  doClose() {
    this.navigationService.back()
  }

}
