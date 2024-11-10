import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastState = new BehaviorSubject<{
    message: string;
    visible: boolean;
    type: 'success' | 'error';
  }>({ message: '', visible: false, type: 'success' });

  getToastState() {
    return this.toastState.asObservable();
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastState.next({ message, visible: true, type });
    setTimeout(
      () =>
        this.toastState.next({ message: '', visible: false, type: 'success' }),
      4000
    ); // Automatically hide after 3 seconds
  }
}
