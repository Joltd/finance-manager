import {Component, OnInit} from '@angular/core';
import {environment} from "../environments/environment";
import {RestInterceptorService} from "./common/service/rest-interceptor.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  version: string = environment.version

  constructor(private restInterceptorService: RestInterceptorService) {}

  loading(): boolean {
    return this.restInterceptorService.loading
  }

}

