import { AfterViewInit, Component, Directive, ElementRef, HostBinding, Input, OnInit } from "@angular/core";
import { AdaptiveService } from "../../service/adaptive.service";

@Component({
  selector: 'common-layout',
  templateUrl: 'common-layout.component.html',
  styleUrls: ['common-layout.component.scss']
})
export class CommonLayoutComponent implements OnInit, AfterViewInit {

  @Input()
  background: 'white' | 'gray' = 'white'

  @Input()
  @HostBinding('class.form')
  form: boolean = false

  constructor(
    private adaptiveService: AdaptiveService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    // this.el.nativeElement.style.display = 'grid'
    // this.el.nativeElement.style.overflow = 'hidden'
    // if (this.adaptiveService.desktop) {
    //   this.el.nativeElement.style.width = '600px'
    // }
  }

  ngAfterViewInit(): void {
    this.el.nativeElement.parentElement.style.display = 'grid'
    if (this.background == 'gray') {
      this.el.nativeElement.parentElement.style.backgroundColor = '#f5f5f5'
    }
  }

  @HostBinding('class.desktop')
  get desktop(): boolean {
    return this.adaptiveService.desktop
  }

}
