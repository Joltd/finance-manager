import {
  AfterContentInit, AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren, EventEmitter,
  HostBinding,
  HostListener,
  Input, Output,
  QueryList
} from "@angular/core";
import {EntryItemComponent} from "../entry-item/entry-item.component";
import {startWith} from "rxjs";

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

  @HostBinding('class.visible')
  visible: boolean = false

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

  @HostListener('click', ['$event'])
  clickOutside(event: Event) {
    this.close()
    event.stopPropagation()
  }

  show() {
    this.visible = true
  }

  close() {
    this.visible = false
  }

}
