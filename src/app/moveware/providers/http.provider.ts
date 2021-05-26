import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CacheService } from '../services/cache.service';

@Injectable()
export class HttpProvider {
    public ticketKey: string | null = null;

    constructor(private http: HttpClient, private cacheService: CacheService) {}

    public formatUrl(relativeUrl: string, command?: boolean): string {
        if (!relativeUrl) {
            throw new Error('missing relativeUrl');
        }
        let rootUrl = command
            ? environment.FRAMEWORK_COMMAND_CONTEXT
            : environment.FRAMEWORK_QUERY_CONTEXT;
        return rootUrl + relativeUrl;
    }

    public get<T>(relativeUrl: string, data?: any, command?: any): Observable<T> {
        relativeUrl = this.formatUrl(relativeUrl, command);
        return this.request<T>(relativeUrl, 'Get', data);
    }

    public post<T>(relativeUrl: string, data: any, command?: boolean): Observable<T> {
        relativeUrl = this.formatUrl(relativeUrl, command);
        return this.requestWithHeaders(relativeUrl, 'Post', data);
    }

    public postFile<T>(relativeUrl: string, formData: FormData, command?: boolean): Observable<T> {
        relativeUrl = this.formatUrl(relativeUrl);
        return this.http.post(relativeUrl, formData, {}).pipe(map((res) => <T>res));
    }

    public put<T>(relativeUrl: string, data?: any, command?: boolean): Observable<T> {
        relativeUrl = this.formatUrl(relativeUrl, command);
        return this.request(relativeUrl, 'Put', data);
    }

    public patch<T>(relativeUrl: string, data: any): Observable<T> {
        relativeUrl = this.formatUrl(relativeUrl);
        return this.request(relativeUrl, 'Patch', data);
    }

    public delete<T>(relativeUrl: string, data: any, command?: boolean): Observable<T> {
        relativeUrl = this.formatUrl(relativeUrl, command);
        return this.request(relativeUrl, 'Delete', data);
    }

    public head<T>(relativeUrl: string): Observable<T> {
        relativeUrl = this.formatUrl(relativeUrl);
        return this.request(relativeUrl, 'Head', null);
    }

    public request<T>(relativeUrl: string, method: string, data?: any): Observable<T> {
        if (!data) {
            data = {};
        }
        if (data.meta) {
            data.meta.userId = this.getUserId();
        } else {
            if (Array.isArray(data)) {
                data.forEach((element) => {
                    if (element.meta) {
                        element.meta.userId = this.getUserId();
                    }
                });
            } else {
                data.userId = this.getUserId();
            }
        }
        let _headers = this.addHeaders(relativeUrl);
        return this.http
            .request(method, relativeUrl, {
                body: data,
                responseType: 'text',
                headers: _headers,
                observe: 'response'
            })
            .pipe(
                map((res) => {
                    if (!res) {
                        return <any>res.body;
                    }
                    return <T>JSON.parse(res.body);
                })
            );
    }
    private addHeaders(url) {
        let _headers = new HttpHeaders();
        let selectedLanguage = JSON.parse(this.cacheService.getSessionData('language'));
        _headers = _headers.set('Accept-Language', selectedLanguage['CodeCode']);

        return _headers;
    }

    public requestWithHeaders<T>(relativeUrl: string, method: string, data?: any): Observable<T> {
        data = this.addUserToRequest(data);
        let _headers = this.addHeaders(relativeUrl);
        return this.http
            .request(method, relativeUrl, {
                body: data,
                responseType: 'text',
                headers: _headers,
                observe: 'response'
            })
            .pipe(
                map((res) => {
                    if (!res) {
                        return <any>res;
                    }
                    return res;
                })
            );
    }

    private addUserToRequest(data) {
        if (!data) {
            data = {};
        }
        if (data.meta) {
            data.meta.userId = this.getUserId();
        }
        if (!data['userId']) {
            data['userId'] = this.getUserId();
        }
        return data;
    }

    private getUserId() {
        if (this.cacheService.getLocalData('user')) {
            return JSON.parse(this.cacheService.getLocalData('user')).preferred_username;
        }
    }
}
