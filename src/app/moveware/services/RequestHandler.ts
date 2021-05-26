import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { HttpProvider } from '../providers/http.provider';

import { WebBaseProvider } from '../providers/web.base.provider';

import { HttpClient, HttpParams } from '@angular/common/http';

import { apiContext } from '../../../environments/environment';

import { CollectionsService } from './collections.service';

import { delay } from 'rxjs/operators';

@Injectable()
export class RequestHandler {
    constructor(
        private webBaseProvider: WebBaseProvider,
        private collectionService: CollectionsService,
        private httpClient: HttpClient
    ) {}

    public handleRequest(
        requestBody: any,
        dynamicAction: any,
        pathParams?: any,
        queryParams?: any,
        command?: boolean
    ): Observable<any> {
        const restrictAPI = dynamicAction['restrictAPI'];
        dynamicAction = dynamicAction['JSONParameter'];
        let _api = dynamicAction.targetAPI
            .replace(apiContext.FRAMEWORK_COMMAND + '/', '')
            .replace(apiContext.FRAMEWORK_QUERY + '/', '');

        if (pathParams || queryParams) {
            _api = this.constructAPIPath(dynamicAction, _api, pathParams, queryParams);
            _api = _api.substring(0, _api.lastIndexOf('&'));
        }

        if (restrictAPI) {
            return new Observable<any>((obs) =>
                obs.next({
                    body: JSON.stringify({
                        result: [],
                        items: []
                    })
                })
            ).pipe(delay(100));
        } else if (dynamicAction.requestMethod === 'GET') {
            return this.webBaseProvider.get<any>(_api, requestBody, command);
        } else if (dynamicAction.requestMethod === 'POST') {
            return this.webBaseProvider.post<any>(_api, requestBody, command);
        } else if (dynamicAction.requestMethod === 'PUT') {
            return this.webBaseProvider.put<any>(_api, requestBody, command);
        } else if (dynamicAction.requestMethod === 'DELETE') {
            return this.webBaseProvider.delete<any>(_api, requestBody, command);
        } else {
            return;
        }
    }

    public loadFieldOptions(fieldId, namedParameters, codeAction, viewId, action): Observable<any> {
        if (action) {
            return this.handleRequest(namedParameters, action, null, {
                field_code: fieldId,
                code_action_id: codeAction,
                viewId: viewId
            });
        }

        return this.collectionService.loadFieldOptions(
            fieldId,
            namedParameters,
            codeAction,
            viewId
        );
    }

    private constructAPIPath(
        dynamicAction: any,
        _apiUrl: any,
        pathParams?: any,
        queryParams?: any
    ) {
        if (pathParams) {
            for (var key in pathParams) {
                if (pathParams.hasOwnProperty(key)) {
                    _apiUrl = _apiUrl.replace(':' + key, pathParams[key]);
                }
            }
        }

        if (queryParams) {
            _apiUrl = _apiUrl + '?';

            for (var key in queryParams) {
                if (queryParams.hasOwnProperty(key)) {
                    _apiUrl = _apiUrl + key + '=' + queryParams[key];
                }

                var lastProperty = lastProperty in queryParams;

                if (key !== lastProperty) {
                    _apiUrl = _apiUrl + '&';
                }
            }
        }

        return _apiUrl;
    }
}
