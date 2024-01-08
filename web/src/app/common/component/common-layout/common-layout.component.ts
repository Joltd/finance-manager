import { Component, Directive, ElementRef, HostBinding, OnInit } from "@angular/core";
import { AdaptiveService } from "../../service/adaptive.service";

@Component({
  selector: 'common-layout',
  templateUrl: 'common-layout.component.html',
  styleUrls: ['common-layout.component.scss']
})
export class CommonLayoutComponent implements OnInit {

  constructor(
    private adaptiveService: AdaptiveService
  ) {}

  ngOnInit(): void {
    // this.el.nativeElement.style.display = 'grid'
    // this.el.nativeElement.style.overflow = 'hidden'
    // if (this.adaptiveService.desktop) {
    //   this.el.nativeElement.style.width = '600px'
    // }
  }

  @HostBinding('class.desktop')
  get desktop(): boolean {
    return this.adaptiveService.desktop
  }

}
