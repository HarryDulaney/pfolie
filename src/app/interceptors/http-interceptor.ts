import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpEvent, HttpRequest, HttpHandler} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class HttpOutInterceptor implements HttpInterceptor {
  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const options = {withCredentials: true};
    return next.handle(httpRequest.clone(options));
  }
}
