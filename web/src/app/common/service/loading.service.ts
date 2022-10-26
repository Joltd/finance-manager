import {EventEmitter, Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  onLoading: EventEmitter<boolean> = new EventEmitter<boolean>()

  startLoading() {
    this.onLoading.emit(true)
  }

  endLoading() {
    this.onLoading.emit(false)
  }

}
