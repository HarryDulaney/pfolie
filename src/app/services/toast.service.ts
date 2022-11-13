import { Injectable, EventEmitter } from '@angular/core';
import { ToastMessage } from '../models/toast-message';
import { SessionService } from './session.service';
import { MessageService } from 'primeng/api';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  public messageEmitter: Subject<any> = new Subject();
  public messageResultEmitter: Subject<boolean> = new Subject();

  private successToast: ToastMessage = {
    key: 'toast',
    severity: 'info',
    summary: 'Success',
    detail: '',
    sticky: false
  };

  private errorToast: ToastMessage = {
    key: 'toast',
    severity: 'error',
    summary: 'Alert!',
    detail: '',
    sticky: false
  };


  private promptToast: ToastMessage = {
    key: 'prompt-toast',
    severity: 'info',
    sticky: true,
    summary: 'Action Required.',
    detail: ''
  };

  private loginToast: ToastMessage = {
    key: 'login-toast',
    severity: 'info',
    summary: 'Accont Required...',
    sticky: false,
    detail: ''
  };


  private mainToast: ToastMessage = {
    key: 'toast',
    severity: 'success',
    sticky: false,
    summary: 'Operation Succeeded',
    detail: ''
  };

  private infoToast: ToastMessage = {
    key: 'toast',
    severity: 'info',
    sticky: false,
    summary: 'Info',
    detail: ''
  };

  constructor() { }

  public showLoginToast(detail: string) {
    this.loginToast.detail = detail;
    this.messageEmitter.next(this.loginToast);
  }


  public showUserPromptToast(detail: string, summary: string): Observable<any> {
    this.promptToast.summary = summary;
    this.promptToast.detail = detail;
    this.messageEmitter.next(this.promptToast);
    return this.messageResultEmitter;
  }

  public showErrorToast(detail: string) {
    this.errorToast.detail = detail;
    this.messageEmitter.next(this.errorToast);
  }

  public showSuccessToast(detail: string) {
    this.successToast.detail = detail;
    this.messageEmitter.next(this.successToast);
  }


  public showMainToast(detail: string, summary: string) {
    this.mainToast.summary = summary;
    this.mainToast.detail = detail;
    this.messageEmitter.next(this.mainToast);
  }


  public showInfoToast(detail: string) {
    this.infoToast.detail = detail;
    this.messageEmitter.next(this.infoToast);
  }

  public showLoginSuccess() {
    this.successToast.detail = 'Login Successful! You can now access all features!';
    this.messageEmitter.next(this.successToast);
  }

}
