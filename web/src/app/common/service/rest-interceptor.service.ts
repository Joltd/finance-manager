import {Injectable} from '@angular/core';
import {
  HTTP_INTERCEPTORS, HttpContextToken,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {ErrorService} from "./error.service";
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

    let skipLoading = req.context.get(SKIP_LOADING) || false

    if (!skipLoading) {
      this.loadingService.startLoading()
    }

    return next.handle(req)
      .pipe(
        map(event => {

          if (!(event instanceof HttpResponse)) {
            return event
          }

          if (!skipLoading) {
            this.loadingService.endLoading()
          }

          let responseBody = event.body as ResponseBody
          if (!responseBody.body && !responseBody.error) {
            return event
          }

          if (!responseBody.success) {
            throw new Error(responseBody.error);
          }

          return event.clone({
            body: responseBody.body
          })

        }),
        catchError(error => {
          if (!skipLoading) {
            this.loadingService.endLoading()
          }
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

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false)
