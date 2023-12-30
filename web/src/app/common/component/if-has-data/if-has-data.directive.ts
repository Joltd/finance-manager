import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { NoDataComponent } from "../no-data/no-data.component";

@Directive({
    selector: '[ifHasData]'
})
export class IfHasDataDirective {

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
  ) {}

  @Input()
  set ifHasData(condition: boolean) {
    this.viewContainerRef.clear()
    if (condition) {
      this.viewContainerRef.createEmbeddedView(this.templateRef)
    } else {
      this.viewContainerRef.createComponent(NoDataComponent)
    }
  }

}
