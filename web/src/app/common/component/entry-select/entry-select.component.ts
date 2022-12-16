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
export class EntrySelectComponent implements AfterViewInit {

  @Input()
  nullable: boolean = false

  @Output()
  select: EventEmitter<any> = new EventEmitter<any>()

  @ContentChildren(EntryItemComponent)
  items!: QueryList<EntryItemComponent>

  @ViewChild(CdkPortal)
  portal!: CdkPortal
  ref!: OverlayRef

  constructor(private overlay: Overlay) {}

  ngAfterViewInit(): void {
    this.items.changes
      .pipe(startWith(this.items))
      .subscribe((items: QueryList<EntryItemComponent>) => {
        for (let item of items) {
          item.select.subscribe(value => {
            this.select.emit(value)
          })
        }
      })
  }

  show() {
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

}
