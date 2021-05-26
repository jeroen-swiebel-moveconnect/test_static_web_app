import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            retry(0),
            catchError((error: HttpErrorResponse) => {
                let _errorMessages = [];
                if (error) {
                    if (error.status) {
                        if (error.status === 500) {
                            let msg = JSON.parse(error.error);
                            let _details = msg.errorCode + ' : ' + msg.details + ', ' + msg.message;
                            _errorMessages.push({ details: _details });
                        } else if (error.status !== 304 && error.status !== 412) {
                            _errorMessages = JSON.parse(error.error);
                        }
                    } else if (error.message) {
                        _errorMessages.push(error.message);
                    }
                }
                return throwError(_errorMessages);
            })
        );
    }
}
