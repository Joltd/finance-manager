import { Injectable } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";

@Injectable({
  providedIn: 'root'
})
export class AdaptiveService {

  desktop: boolean = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
  ) {
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait])
      .subscribe(state => this.desktop = !state.matches)
  }

}
