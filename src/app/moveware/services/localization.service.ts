import { HttpClient } from '@angular/common/http';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { apiContext, environment } from 'src/environments/environment';

export function HttpLoaderFactory(http: HttpClient) {
    return new MultiTranslateHttpLoader(http, [
        {
            prefix:
                environment.FRAMEWORK_QUERY_ROOT +
                '/' +
                (apiContext.CONTEXT_ROOT_REQUIRED ? apiContext.FRAMEWORK_QUERY + '/' : '') +
                'i18n/lables?lang=',
            suffix: ''
        },
        {
            prefix:
                environment.FRAMEWORK_QUERY_ROOT +
                '/' +
                (apiContext.CONTEXT_ROOT_REQUIRED ? apiContext.FRAMEWORK_QUERY + '/' : '') +
                'i18n/events?lang=',
            suffix: ''
        },
        {
            prefix:
                environment.FRAMEWORK_QUERY_ROOT +
                '/' +
                (apiContext.CONTEXT_ROOT_REQUIRED ? apiContext.FRAMEWORK_QUERY + '/' : '') +
                'i18n/settings?lang=',
            suffix: ''
        }
    ]);
}
