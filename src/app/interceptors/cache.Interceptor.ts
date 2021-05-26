import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
const NON_CACHABLE_APIS = [
    'search',
    'form-metadata',
    'refresh-record',
    'field-options',
    'i18n',
    'validation'
];

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
    // private cache = new Map<string, any>();
    //private etags = new Map<string, string>();
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isCachable(req)) {
            return next.handle(req);
        }
        let reqKey = req.url + JSON.stringify(req.body);
        let etag = this.getEtag(reqKey);
        if (etag && req.url.indexOf('objects') >= 0) {
            req = req.clone({ setHeaders: { 'If-None-Match': '"' + etag + '"' } });
        }

        return next
            .handle(req)
            .pipe(
                tap((response) => {
                    if (response instanceof HttpResponse) {
                        if (response.url.indexOf('objects') >= 0) {
                            this.setCachedData(reqKey, response);
                            return response.body;
                        }
                        return response;
                    }
                })
            )
            .pipe(
                retry(0),
                catchError((error) => {
                    if (error && (error.status === 304 || error.status === 412)) {
                        let data = this.getCachedData(reqKey);
                        let cahcedData = JSON.parse(data);
                        return of(
                            new HttpResponse({
                                status: 200,
                                body: cahcedData['body'],
                                headers: cahcedData['headers']
                            })
                        ); //return of(new HttpResponse({ status: 200, body: cahcedData["body"] }));
                    }
                    // else if (error.status === 412) {
                    //   let data = this.getCachedData(reqKey);
                    //   return of(new HttpResponse({ status: 200, body: data["body"], headers: data["headers"] }));
                    // }
                    else {
                        return throwError(error);
                    }
                })
            );
    }

    getCachedData(reqKey) {
        let etag = localStorage.getItem(reqKey);
        let data = localStorage.getItem(etag);
        return data || null;
    }
    setCachedData(reqKey, response) {
        let etag = response.headers.get('etag');
        if (response.url.indexOf('objects') >= 0 && etag) {
            let cachable = this.isCachable(response);
            if (cachable) {
                localStorage.setItem(reqKey, eval(etag));
                localStorage.setItem(eval(etag), JSON.stringify(response));
            }
        }
    }
    private isCachable(response) {
        let cachable = true;
        return false;
        NON_CACHABLE_APIS.forEach((element) => {
            if (response.url.indexOf(element) >= 0) {
                cachable = false;
                return;
            }
        });
        return cachable;
    }
    private getEtag(reqKey) {
        let etag = localStorage.getItem(reqKey);
        let data = localStorage.getItem(etag);
        return etag && data ? etag : null;
    }
}
