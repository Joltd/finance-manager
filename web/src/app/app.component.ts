import {Component, OnInit} from '@angular/core';
import {environment} from "../environments/environment";
import {RestInterceptorService} from "./common/service/rest-interceptor.service";
import {LoadingService} from "./common/service/loading.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  version: string = environment.version
  loading: boolean = false

  constructor(public loadingService: LoadingService) {
    this.loadingService.onLoading.subscribe(result => {
      setTimeout(() => this.loading = result)
    })
  }

}

