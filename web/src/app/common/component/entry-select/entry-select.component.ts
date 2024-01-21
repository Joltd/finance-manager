import {
  AfterViewInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild
} from "@angular/core";
import {EntryItemComponent} from "../entry-item/entry-item.component";
import {startWith} from "rxjs";
import {Overlay, OverlayConfig, OverlayRef} from "@angular/cdk/overlay";
import {CdkPortal} from "@angular/cdk/portal";

@Component({
  selector: 'entry-select',
  templateUrl: 'entry-select.component.html',
  styleUrls: ['entry-select.component.scss']
})
export class EntrySelectComponent {

  @ContentChildren(EntryItemComponent)
  items!: QueryList<EntryItemComponent>

  @ViewChild(CdkPortal)
  portal!: CdkPortal
  ref!: OverlayRef

  constructor(private overlay: Overlay) {}

  show(data: any = null) {
    if (data) {
      this.items.forEach(item => item.value = data)
    }
    let config = new OverlayConfig({
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
    })
    this.ref = this.overlay.create(config)
    this.ref.attach(this.portal)
    this.ref.backdropClick().subscribe(() => this.close())
  }

  close() {
    if (this.ref != undefined) {
      this.ref.detach()
    }
  }

  visible(): boolean {
    return this.ref?.hasAttached()
  }

  search(event: any) {
    console.log(event)
  }

}
