import { Component } from "@angular/core";

@Component({
  selector: 'entity-browser',
  templateUrl: 'entity-browser.component.html',
  styleUrls: ['entity-browser.component.scss']
})
export class EntityBrowserComponent {

  onFirst() {
    console.log('First')
  }

  onSecond() {
    console.log('Second')
  }

}
