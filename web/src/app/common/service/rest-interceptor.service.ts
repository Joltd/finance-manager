import {Injectable} from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {ErrorService} from "./error.service";
import {plainToClass} from "class-transformer";
import {TypeUtils} from "./type-utils";
import {environment} from "../../../environments/environment";
import {Location} from "@angular/common";
import {LoadingService} from "./loading.service";

@Injectable({
  providedIn: 'root'
})
export class RestInterceptorService implements HttpInterceptor {

  constructor(
    private errorService: ErrorService,
    private loadingService: LoadingService,
    private location: Location
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let url = environment.backend + req.url
    if (environment.production) {
      url = this.location.prepareExternalUrl(url)
    }
    req = req.clone({url: url})

    if (req.responseType != 'json') {
      return next.handle(req);
    }

    this.loadingService.startLoading()

    return next.handle(req)
      .pipe(
        map(event => {

          if (!(event instanceof HttpResponse)) {
            return event
          }

          this.loadingService.endLoading()

          let responseBody = event.body as ResponseBody
          if (!responseBody.body && !responseBody.error) {
            return event
          }

          if (!responseBody.success) {
            throw new Error(responseBody.error);
          }

          let type = TypeUtils.get(req)
          if (!type) {
            return event
          }

          return event.clone({
            body: plainToClass(type, responseBody.body)
          })

        }),
        catchError(error => {
          this.loadingService.endLoading()
          let message: string
          if (error.statusText) {
            message = error.statusText
          } else if (error?.message) {
            message = error?.message
          } else {
            message = "Unknown error"
          }
          this.errorService.register('ERROR', message)
          return throwError(error)
        })
      )
  }

}

export const restInterceptorProvider = [
  { provide: HTTP_INTERCEPTORS, useClass: RestInterceptorService, multi: true }
]

class ResponseBody {
  success: boolean = false
  body!: object
  error!: string
}
